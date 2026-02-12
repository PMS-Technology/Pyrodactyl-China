import { useEffect, useMemo, useState } from 'react';
import isEqual from 'react-fast-compare';
import { toast } from 'sonner';

import ActionButton from '@/components/elements/ActionButton';
import ConfirmationModal from '@/components/elements/ConfirmationModal';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from '@/components/elements/DropdownMenu';
import { MainPageHeader } from '@/components/elements/MainPageHeader';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import Spinner from '@/components/elements/Spinner';
import { Switch } from '@/components/elements/SwitchV2';
import TitledGreyBox from '@/components/elements/TitledGreyBox';
import HugeIconsAlert from '@/components/elements/hugeicons/Alert';
import HugeIconsEggs from '@/components/elements/hugeicons/Egg';
import OperationProgressModal from '@/components/server/operations/OperationProgressModal';

import { httpErrorToHuman } from '@/api/http';
import getNests from '@/api/nests/getNests';
import applyEggChange from '@/api/server/applyEggChange';
import previewEggChange, { EggPreview } from '@/api/server/previewEggChange';
import { ServerOperation } from '@/api/server/serverOperations';
import getServerBackups from '@/api/swr/getServerBackups';
import getServerStartup from '@/api/swr/getServerStartup';

import { ServerContext } from '@/state/server';

import { useDeepCompareEffect } from '@/plugins/useDeepCompareEffect';

interface Egg {
    object: string;
    attributes: {
        id: number;
        uuid: string;
        name: string;
        description: string;
    };
}

interface Nest {
    object: string;
    attributes: {
        id: number;
        uuid: string;
        author: string;
        name: string;
        description: string;
        created_at: string;
        updated_at: string;
        relationships: {
            eggs: {
                object: string;
                data: Egg[];
            };
        };
    };
}

const MAX_DESCRIPTION_LENGTH = 150;
const hidden_nest_prefix = '!';
const blank_egg_prefix = '@';

type FlowStep = 'overview' | 'select-game' | 'select-software' | 'configure' | 'review';

// Laravel-style validation function
const validateEnvironmentVariables = (variables: any[], pendingVariables: Record<string, string>): string[] => {
    const errors: string[] = [];

    variables.forEach((variable) => {
        if (!variable.user_editable) return; // Skip non-editable variables

        const value = pendingVariables[variable.env_variable] || '';
        const rules = variable.rules || '';
        const ruleArray = rules
            .split('|')
            .map((rule) => rule.trim())
            .filter((rule) => rule.length > 0);

        // Check if variable is required (backend automatically adds nullable if not present)
        const isRequired = ruleArray.includes('required');
        const isNullable = ruleArray.includes('nullable') || !isRequired;

        // If required and empty/null
        if (isRequired && (!value || value.trim() === '')) {
            errors.push(`${variable.name} 是必填项。`);
            return;
        }

        // If nullable and empty, skip other validations
        if (isNullable && (!value || value.trim() === '')) {
            return;
        }

        // Validate each rule
        ruleArray.forEach((rule) => {
            const [ruleName, ruleValue] = rule.split(':');

            switch (ruleName) {
                case 'string':
                    if (typeof value !== 'string') {
                        errors.push(`${variable.name} 必须是字符串。`);
                    }
                    break;

                case 'integer':
                case 'numeric':
                    if (value && isNaN(Number(value))) {
                        errors.push(`${variable.name} 必须是数字。`);
                    }
                    break;

                case 'boolean': {
                    const boolValues = ['true', 'false', '1', '0', 'yes', 'no', 'on', 'off'];
                    if (value && !boolValues.includes(value.toLowerCase())) {
                        errors.push(`${variable.name} 必须是 true 或 false。`);
                    }
                    break;
                }

                case 'min': {
                    if (ruleValue && value) {
                        const minValue = parseInt(ruleValue);
                        if (value.length < minValue) {
                            errors.push(`${variable.name} 至少需要 ${minValue} 个字符。`);
                        }
                    }
                    break;
                }

                case 'max': {
                    if (ruleValue && value) {
                        const maxValue = parseInt(ruleValue);
                        if (value.length > maxValue) {
                            errors.push(`${variable.name} 不能超过 ${maxValue} 个字符。`);
                        }
                    }
                    break;
                }

                case 'between': {
                    if (ruleValue && value) {
                        const [min, max] = ruleValue.split(',').map((v) => parseInt(v.trim()));
                        if (value.length < min || value.length > max) {
                            errors.push(`${variable.name} 必须在 ${min} 到 ${max} 个字符之间。`);
                        }
                    }
                    break;
                }

                case 'in': {
                    if (ruleValue && value) {
                        const allowedValues = ruleValue.split(',').map((v) => v.trim());
                        if (!allowedValues.includes(value)) {
                            errors.push(`${variable.name} 必须是以下值之一: ${allowedValues.join(', ')}。`);
                        }
                    }
                    break;
                }

                case 'regex': {
                    if (ruleValue && value) {
                        try {
                            // Handle Laravel regex format: regex:/pattern/flags
                            const regexMatch = ruleValue.match(/^\/(.+)\/([gimuy]*)$/);
                            if (regexMatch) {
                                const regex = new RegExp(regexMatch[1], regexMatch[2]);
                                if (!regex.test(value)) {
                                    errors.push(`${variable.name} 格式无效。`);
                                }
                            }
                        } catch (e) {
                            // Invalid regex - skip validation
                        }
                    }
                    break;
                }

                case 'alpha':
                    if (value && !/^[a-zA-Z]+$/.test(value)) {
                        errors.push(`${variable.name} 只能包含字母。`);
                    }
                    break;

                case 'alpha_num':
                    if (value && !/^[a-zA-Z0-9]+$/.test(value)) {
                        errors.push(`${variable.name} 只能包含字母和数字。`);
                    }
                    break;

                case 'alpha_dash':
                    if (value && !/^[a-zA-Z0-9_-]+$/.test(value)) {
                        errors.push(`${variable.name} 只能包含字母、数字、短横线和下划线。`);
                    }
                    break;

                case 'url':
                    if (value) {
                        try {
                            new URL(value);
                        } catch {
                            errors.push(`${variable.name} 必须是有效的 URL。`);
                        }
                    }
                    break;

                case 'email':
                    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                        errors.push(`${variable.name} 必须是有效的邮箱地址。`);
                    }
                    break;

                case 'ip': {
                    if (value) {
                        const ipRegex =
                            /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
                        if (!ipRegex.test(value)) {
                            errors.push(`${variable.name} 必须是有效的 IP 地址。`);
                        }
                    }
                    break;
                }

                // Skip validation rules that don't apply to frontend
                case 'required':
                case 'nullable':
                case 'sometimes':
                    break;

                default:
                    // Unknown rule - log for debugging but don't error
                    if (
                        process.env.NODE_ENV === 'development' &&
                        !['string', 'array', 'file', 'image'].includes(ruleName)
                    ) {
                        console.warn(`Unknown validation rule: ${ruleName} for variable ${variable.name}`);
                    }
                    break;
            }
        });
    });

    return errors;
};

const SoftwareContainer = () => {
    const serverData = ServerContext.useStoreState((state) => state.server.data);
    const uuid = serverData?.uuid;
    const [nests, setNests] = useState<Nest[]>();
    //const eggs = nests?.reduce(
    //    (eggArray, nest) => [...eggArray, ...nest.attributes.relationships.eggs.data],
    //    [] as Egg[],
    //);
    const currentEgg = serverData?.egg;
    //const originalEgg = currentEgg;
    const currentEggName = useMemo(() => {
        // Don't attempt calculation until both nests data and currentEgg are available
        if (!nests || !currentEgg) {
            return undefined;
        }

        const foundNest = nests.find((nest) =>
            nest?.attributes?.relationships?.eggs?.data?.find((egg) => egg?.attributes?.uuid === currentEgg),
        );

        return foundNest?.attributes?.relationships?.eggs?.data?.find((egg) => egg?.attributes?.uuid === currentEgg)
            ?.attributes?.name;
    }, [nests, currentEgg]);
    const backupLimit = serverData?.featureLimits.backups;
    const { data: backups } = getServerBackups();
    const setServerFromState = ServerContext.useStoreActions((actions) => actions.server.setServerFromState);

    // Flow state
    const [currentStep, setCurrentStep] = useState<FlowStep>('overview');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedNest, setSelectedNest] = useState<Nest | null>(null);
    const [selectedEgg, setSelectedEgg] = useState<Egg | null>(null);
    const [eggPreview, setEggPreview] = useState<EggPreview | null>(null);
    const [pendingVariables, setPendingVariables] = useState<Record<string, string>>({});
    const [variableErrors, setVariableErrors] = useState<Record<string, string>>({});
    const [currentOperationId, setCurrentOperationId] = useState<string | null>(null);
    const [showOperationModal, setShowOperationModal] = useState(false);
    const [showWipeConfirmation, setShowWipeConfirmation] = useState(false);
    const [wipeCountdown, setWipeCountdown] = useState(5);
    const [wipeLoading, setWipeLoading] = useState(false);
    const [shiftPressed, setShiftPressed] = useState(false);

    // Configuration options
    const [shouldBackup, setShouldBackup] = useState(false);
    const [shouldWipe, setShouldWipe] = useState(false);
    const [showFullDescriptions, setShowFullDescriptions] = useState<Record<string, boolean>>({});

    // Startup and Docker configuration
    const [customStartup, setCustomStartup] = useState('');
    const [selectedDockerImage, setSelectedDockerImage] = useState('');

    // Data loading
    useEffect(() => {
        const fetchData = async () => {
            const data = await getNests();
            setNests(data);
        };
        fetchData();
    }, []);

    const variables = ServerContext.useStoreState(
        ({ server }) => ({
            variables: server.data?.variables || [],
            invocation: server.data?.invocation || '',
            dockerImage: server.data?.dockerImage || '',
        }),
        isEqual,
    );

    const { data, mutate } = getServerStartup(uuid || '', {
        ...variables,
        dockerImages: { [variables.dockerImage]: variables.dockerImage },
        rawStartupCommand: variables.invocation,
    });

    useDeepCompareEffect(() => {
        if (!data) return;
        setServerFromState((s) => ({
            ...s,
            invocation: data.invocation,
            variables: data.variables,
        }));
    }, [data]);

    // Initialize backup setting based on limits
    useEffect(() => {
        if (backups) {
            // null = unlimited, 0 = disabled, positive number = cap
            setShouldBackup(backupLimit !== 0 && (backupLimit === null || backups.backupCount < backupLimit));
        }
    }, [backups, backupLimit]);

    // Countdown effect for wipe confirmation modal
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (showWipeConfirmation && wipeCountdown > 0) {
            interval = setInterval(() => {
                setWipeCountdown((prev) => prev - 1);
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [showWipeConfirmation, wipeCountdown]);

    // Reset countdown when wipe confirmation modal opens
    useEffect(() => {
        if (showWipeConfirmation) {
            setWipeCountdown(5);
        }
    }, [showWipeConfirmation]);

    const handleKeyDown = (event) => {
        if (event.shiftKey) setShiftPressed(true);
    };

    const handleKeyUp = (event) => {
        if (!event.shiftKey) setShiftPressed(false);
    };

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
        };
    });

    // Flow control functions
    const resetFlow = () => {
        setCurrentStep('overview');
        setSelectedNest(null);
        setSelectedEgg(null);
        setEggPreview(null);
        setPendingVariables({});
        setVariableErrors({});
        setShouldBackup(backupLimit !== 0 && (backupLimit === null || (backups?.backupCount || 0) < backupLimit));
        setShouldWipe(false);
        setCustomStartup('');
        setSelectedDockerImage('');
    };

    const handleNestSelection = (nest: Nest) => {
        setSelectedNest(nest);
        setSelectedEgg(null);
        setEggPreview(null);
        setPendingVariables({});
        setVariableErrors({});
        setCustomStartup('');
        setSelectedDockerImage('');
        setCurrentStep('select-software');
    };

    const handleEggSelection = async (egg: Egg) => {
        if (!selectedNest || !uuid) return;

        setIsLoading(true);
        setSelectedEgg(egg);

        try {
            const preview = await previewEggChange(uuid, egg.attributes.id, selectedNest.attributes.id);
            setEggPreview(preview);

            // Check for subdomain compatibility warnings
            if (preview.warnings && preview.warnings.length > 0) {
                const subdomainWarning = preview.warnings.find((w) => w.type === 'subdomain_incompatible');
                if (subdomainWarning) {
                    toast.error(subdomainWarning.message, {
                        duration: 8000,
                        dismissible: true,
                    });
                }
            }

            // Initialize variables with current values or defaults
            const initialVariables: Record<string, string> = {};
            preview.variables.forEach((variable) => {
                const existingVar = data?.variables.find((v) => v.envVariable === variable.env_variable);
                initialVariables[variable.env_variable] = existingVar?.serverValue || variable.default_value || '';
            });
            setPendingVariables(initialVariables);

            // Set default startup command and docker image
            setCustomStartup(preview.egg.startup);

            // Automatically select the default docker image if available
            // Backend returns: {"Display Name": "actual/image:tag"}
            const availableDisplayNames = Object.keys(preview.docker_images || {});
            if (preview.default_docker_image && availableDisplayNames.includes(preview.default_docker_image)) {
                setSelectedDockerImage(preview.default_docker_image);
            } else if (availableDisplayNames.length > 0 && availableDisplayNames[0]) {
                setSelectedDockerImage(availableDisplayNames[0]);
            }

            setCurrentStep('configure');
        } catch (error) {
            console.error(error);
            toast.error(httpErrorToHuman(error));
        } finally {
            setIsLoading(false);
        }
    };

    const handleVariableChange = (envVariable: string, value: string) => {
        setPendingVariables((prev) => ({ ...prev, [envVariable]: value }));

        // Validate this specific variable in real-time and update errors
        if (eggPreview) {
            const variable = eggPreview.variables.find((v) => v.env_variable === envVariable);
            if (variable) {
                const errors = validateEnvironmentVariables([variable], { [envVariable]: value });
                setVariableErrors((prev) => {
                    const newErrors = { ...prev };
                    if (errors.length > 0 && errors[0]) {
                        newErrors[envVariable] = errors[0];
                    } else {
                        delete newErrors[envVariable];
                    }
                    return newErrors;
                });
            }
        }
    };

    const proceedToReview = () => {
        setCurrentStep('review');
    };

    const applyChanges = async () => {
        if (!selectedEgg || !selectedNest || !eggPreview) return;

        // Show final confirmation if wipe files is selected without backup
        if (shouldWipe && !shouldBackup) {
            setShowWipeConfirmation(true);
            return;
        }

        // Proceed with the operation
        executeApplyChanges();
    };

    const executeApplyChanges = async () => {
        if (!selectedEgg || !selectedNest || !eggPreview || !uuid) return;

        setIsLoading(true);

        try {
            // Validate all variables using Laravel-style validation rules
            const validationErrors = validateEnvironmentVariables(eggPreview.variables, pendingVariables);

            if (validationErrors.length > 0) {
                throw new Error(`Validation failed:\n${validationErrors.join('\n')}`);
            }

            // Convert display name back to actual image for backend
            const actualDockerImage =
                selectedDockerImage && eggPreview.docker_images
                    ? eggPreview.docker_images[selectedDockerImage]
                    : eggPreview.default_docker_image && eggPreview.docker_images
                      ? eggPreview.docker_images[eggPreview.default_docker_image]
                      : '';

            // Filter out empty environment variables to prevent validation issues
            const filteredEnvironment: Record<string, string> = {};
            Object.entries(pendingVariables).forEach(([key, value]) => {
                if (value && value.trim() !== '') {
                    filteredEnvironment[key] = value;
                }
            });

            // Start the async operation
            const response = await applyEggChange(uuid, {
                egg_id: selectedEgg.attributes.id,
                nest_id: selectedNest.attributes.id,
                docker_image: actualDockerImage,
                startup_command: customStartup,
                environment: filteredEnvironment,
                should_backup: shouldBackup,
                should_wipe: shouldWipe,
            });

            // Operation started successfully - show progress modal
            setCurrentOperationId(response.operation_id);
            setShowOperationModal(true);

            toast.success('软件更改操作已成功启动');

            // Reset the configuration flow but keep the modal open
            resetFlow();
        } catch (error) {
            console.error('Failed to start egg change operation:', error);
            toast.error(httpErrorToHuman(error));
        } finally {
            setIsLoading(false);
        }
    };

    const handleWipeConfirm = () => {
        setShowWipeConfirmation(false);
        setWipeLoading(true);
        executeApplyChanges().finally(() => setWipeLoading(false));
    };

    const handleOperationComplete = (operation: ServerOperation) => {
        if (operation.is_completed) {
            toast.success('您的软件配置已成功应用');

            // Refresh server data to reflect changes
            mutate();
        } else if (operation.has_failed) {
            toast.error(operation.message || '软件配置更改失败');
        }
    };

    const handleOperationError = (error: Error) => {
        toast.error(error.message || '监控操作时发生错误');
    };

    const closeOperationModal = () => {
        setShowOperationModal(false);
        setCurrentOperationId(null);
    };

    const toggleDescription = (id: string) => {
        setShowFullDescriptions((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const renderDescription = (description: string, id: string) => {
        const isLong = description.length > MAX_DESCRIPTION_LENGTH;
        const showFull = showFullDescriptions[id];

        return (
            <p className='text-sm text-neutral-400 leading-relaxed'>
                {isLong && !showFull ? (
                    <>
                        {description.slice(0, MAX_DESCRIPTION_LENGTH)}...{' '}
                        <button
                            onClick={() => toggleDescription(id)}
                            className='text-brand hover:underline font-medium'
                        >
                            显示更多
                        </button>
                    </>
                ) : (
                    <>
                        {description}
                        {isLong && (
                            <>
                                {' '}
                                <button
                                    onClick={() => toggleDescription(id)}
                                    className='text-brand hover:underline font-medium'
                                >
                                    显示较少
                                </button>
                            </>
                        )}
                    </>
                )}
            </p>
        );
    };

    const renderOverview = () => (
        <TitledGreyBox title='当前软件'>
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
                <div className='flex items-center gap-3 sm:gap-4 min-w-0 flex-1'>
                    <div className='w-10 h-10 sm:w-12 sm:h-12 bg-[#ffffff11] rounded-lg flex items-center justify-center flex-shrink-0'>
                        <HugeIconsEggs fill='currentColor' className='w-5 h-5 sm:w-6 sm:h-6 text-neutral-300' />
                    </div>
                    <div className='min-w-0 flex-1'>
                        {currentEggName ? (
                            currentEggName.includes(blank_egg_prefix) ? (
                                <p className='text-amber-400 font-medium text-sm sm:text-base'>未选择软件</p>
                            ) : (
                                <p className='text-neutral-200 font-medium text-sm sm:text-base truncate'>
                                    {currentEggName}
                                </p>
                            )
                        ) : (
                            <div className='flex items-center gap-2'>
                                <Spinner size='small' />
                                <span className='text-neutral-400 text-sm'>加载中...</span>
                            </div>
                        )}
                        <p className='text-xs sm:text-sm text-neutral-400 leading-relaxed'>
管理您的服务器游戏或软件配置
                        </p>
                    </div>
                </div>
                <div className='flex-shrink-0 w-full sm:w-auto'>
                    <ActionButton
                        variant='primary'
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            try {
                                setCurrentStep('select-game');
                            } catch (error) {
                                console.error('Error in change software click:', error);
                            }
                        }}
                        className='w-full sm:w-auto'
                        disabled={isLoading}
                    >
                        {isLoading && <Spinner size='small' />}
                        更改软件
                    </ActionButton>
                </div>
            </div>
        </TitledGreyBox>
    );

    const renderGameSelection = () => (
        <TitledGreyBox title='选择类别'>
            <div className='space-y-4'>
                <p className='text-sm text-neutral-400'>选择您想要运行的游戏或软件类型</p>

                <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4'>
                    {nests?.map((nest) =>
                        nest?.attributes?.name?.includes(hidden_nest_prefix) ? null : (
                            <button
                                key={nest?.attributes?.uuid}
                                onClick={() => handleNestSelection(nest)}
                                className='p-4 sm:p-5 bg-[#ffffff08] border border-[#ffffff12] rounded-lg hover:border-[#ffffff20] transition-all text-left active:bg-[#ffffff12] touch-manipulation'
                            >
                                <h3 className='font-semibold text-neutral-200 mb-2 text-base sm:text-lg'>
                                    {nest?.attributes?.name}
                                </h3>
                                {renderDescription(
                                    nest?.attributes?.description || '',
                                    `nest-${nest?.attributes?.uuid}`,
                                )}
                            </button>
                        ),
                    )}
                </div>

                <div className='flex justify-center pt-4'>
                    <ActionButton
                        variant='secondary'
                        onClick={() => setCurrentStep('overview')}
                        className='w-full sm:w-auto'
                    >
                        返回概览
                    </ActionButton>
                </div>
            </div>
        </TitledGreyBox>
    );

    const renderSoftwareSelection = () => (
        <TitledGreyBox title={`选择软件 - ${selectedNest?.attributes.name}`}>
            <div className='space-y-4'>
                <p className='text-sm text-neutral-400'>为您的服务器选择特定的软件版本</p>

                {isLoading ? (
                    <div className='flex items-center justify-center py-16'>
                        <div className='flex flex-col items-center text-center'>
                            <Spinner size='large' />
                            <p className='text-neutral-400 mt-4'>加载软件选项中...</p>
                        </div>
                    </div>
                ) : (
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4'>
                        {selectedNest?.attributes?.relationships?.eggs?.data?.map((egg) => (
                            <button
                                key={egg.attributes.uuid}
                                onClick={() => handleEggSelection(egg)}
                                disabled={isLoading}
                                className='p-4 bg-[#ffffff08] border border-[#ffffff12] rounded-lg hover:border-[#ffffff20] transition-all text-left touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed'
                            >
                                <div className='flex items-center gap-2 mb-2'>
                                    {isLoading && selectedEgg?.attributes?.uuid === egg?.attributes?.uuid && (
                                        <Spinner size='small' />
                                    )}
                                    <h3 className='font-semibold text-neutral-200 text-sm sm:text-base'>
                                        {egg?.attributes?.name}
                                    </h3>
                                </div>
                                {renderDescription(egg?.attributes?.description || '', `egg-${egg?.attributes?.uuid}`)}
                            </button>
                        ))}
                    </div>
                )}

                <div className='flex flex-col sm:flex-row justify-center gap-3 pt-4'>
                    <ActionButton
                        variant='secondary'
                        onClick={() => setCurrentStep('select-game')}
                        className='w-full sm:w-auto'
                    >
                        返回游戏
                    </ActionButton>
                    <ActionButton
                        variant='secondary'
                        onClick={() => setCurrentStep('overview')}
                        className='w-full sm:w-auto'
                    >
                        取消
                    </ActionButton>
                </div>
            </div>
        </TitledGreyBox>
    );

    const renderConfiguration = () => (
        <div className='space-y-6'>
            <TitledGreyBox title={`配置 ${selectedEgg?.attributes.name}`}>
                {eggPreview && (
                    <div className='space-y-6'>
                        {/* 软件配置 */}
                        <div className='space-y-4'>
                            <h3 className='text-lg font-semibold text-neutral-200'>软件配置</h3>
                            <div className='grid grid-cols-1 xl:grid-cols-2 gap-4'>
                                <div>
                                    <label className='text-sm font-medium text-neutral-300 block mb-2'>
                                        启动命令
                                    </label>
                                    <textarea
                                        value={customStartup}
                                        onChange={(e) => setCustomStartup(e.target.value)}
                                        placeholder='输入自定义启动命令...'
                                        rows={3}
                                        className='w-full px-3 py-2 bg-[#ffffff08] border border-[#ffffff12] rounded-lg text-sm text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-brand transition-colors font-mono resize-none'
                                    />
                                    <p className='text-xs text-neutral-400 mt-1'>
                                        使用变量如{' '}
                                        {eggPreview.variables
                                            .map((v) => `{{${v.env_variable}}}`)
                                            .slice(0, 3)
                                            .join(', ')}
                                        {eggPreview.variables.length > 3 && ', etc.'}
                                    </p>
                                </div>
                                <div>
                                    <label className='text-sm font-medium text-neutral-300 block mb-2'>
                                        Docker 镜像
                                    </label>
                                    {eggPreview.docker_images && Object.keys(eggPreview.docker_images).length > 1 ? (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button className='w-full px-3 py-2 bg-[#ffffff08] border border-[#ffffff12] rounded-lg text-sm text-neutral-200 focus:outline-none focus:border-brand transition-colors text-left flex items-center justify-between hover:border-[#ffffff20]'>
                                                    <span className='truncate'>
                                                        {selectedDockerImage || '选择镜像...'}
                                                    </span>
                                                    <svg
                                                        className='w-4 h-4 text-neutral-400 flex-shrink-0'
                                                        fill='none'
                                                        stroke='currentColor'
                                                        viewBox='0 0 24 24'
                                                    >
                                                        <path
                                                            strokeLinecap='round'
                                                            strokeLinejoin='round'
                                                            strokeWidth={2}
                                                            d='M19 9l-7 7-7-7'
                                                        />
                                                    </svg>
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className='w-full min-w-[300px]'>
                                                <DropdownMenuRadioGroup
                                                    value={selectedDockerImage}
                                                    onValueChange={setSelectedDockerImage}
                                                >
                                                    {Object.entries(eggPreview.docker_images).map(
                                                        ([displayName, _]) => (
                                                            <DropdownMenuRadioItem
                                                                key={displayName}
                                                                value={displayName}
                                                                className='text-sm font-mono'
                                                            >
                                                                <span>{displayName}</span>
                                                            </DropdownMenuRadioItem>
                                                        ),
                                                    )}
                                                </DropdownMenuRadioGroup>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    ) : (
                                        <div className='w-full px-3 py-2 bg-[#ffffff08] border border-[#ffffff12] rounded-lg text-sm text-neutral-200'>
                                            {(eggPreview.docker_images && Object.keys(eggPreview.docker_images)[0]) ||
                                                '默认镜像'}
                                        </div>
                                    )}
                                    <p className='text-xs text-neutral-400 mt-1'>
                                        服务器的容器运行环境
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* 环境变量 */}
                        {eggPreview.variables.length > 0 && (
                            <div className='space-y-4'>
                                <h3 className='text-lg font-semibold text-neutral-200'>环境变量</h3>
                                <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                                    {eggPreview.variables.map((variable) => (
                                        <div key={variable.env_variable} className='space-y-3'>
                                            <div>
                                                <label className='text-sm font-medium text-neutral-200 block mb-1'>
                                                    {variable.name}
                                                    {!variable.user_editable && (
                                                        <span className='ml-2 px-2 py-0.5 text-xs bg-amber-500/20 text-amber-400 rounded'>
                                                            只读
                                                        </span>
                                                    )}
                                                    {variable.user_editable && variable.rules.includes('required') && (
                                                        <span className='ml-2 px-2 py-0.5 text-xs bg-red-500/20 text-red-400 rounded'>
                                                            必填
                                                        </span>
                                                    )}
                                                    {variable.user_editable && !variable.rules.includes('required') && (
                                                        <span className='ml-2 px-2 py-0.5 text-xs bg-neutral-500/20 text-neutral-400 rounded'>
                                                            可选
                                                        </span>
                                                    )}
                                                </label>
                                                {variable.description && (
                                                    <p className='text-xs text-neutral-400 mb-2'>
                                                        {variable.description}
                                                    </p>
                                                )}
                                            </div>

                                            {variable.user_editable ? (
                                                <div>
                                                    <input
                                                        type='text'
                                                        value={pendingVariables[variable.env_variable] || ''}
                                                        onChange={(e) =>
                                                            handleVariableChange(variable.env_variable, e.target.value)
                                                        }
                                                        placeholder={variable.default_value || '输入值...'}
                                                        className={`w-full px-3 py-2 bg-[#ffffff08] border rounded-lg text-sm text-neutral-200 placeholder:text-neutral-500 focus:outline-none transition-colors ${
                                                            variableErrors[variable.env_variable]
                                                                ? 'border-red-500 focus:border-red-500'
                                                                : 'border-[#ffffff12] focus:border-brand'
                                                        }`}
                                                    />
                                                    {variableErrors[variable.env_variable] && (
                                                        <p className='text-xs text-red-400 mt-1'>
                                                            {variableErrors[variable.env_variable]}
                                                        </p>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className='w-full px-3 py-2 bg-[#ffffff04] border border-[#ffffff08] rounded-lg text-sm text-neutral-300 font-mono'>
                                                    {pendingVariables[variable.env_variable] ||
                                                        variable.default_value ||
                                                        '未设置'}
                                                </div>
                                            )}

                                            <div className='flex justify-between text-xs'>
                                                <span className='text-neutral-500 font-mono'>
                                                    {variable.env_variable}
                                                </span>
                                                {variable.rules && (
                                                    <span className='text-neutral-500'>规则: {variable.rules}</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Safety Options */}
                        <div className='space-y-4'>
                            <h3 className='text-lg font-semibold text-neutral-200'>安全选项</h3>
                            <div className='space-y-3'>
                                <div className='flex items-center justify-between p-4 bg-[#ffffff08] border border-[#ffffff12] rounded-lg hover:border-[#ffffff20] transition-colors'>
                                    <div className='flex-1 min-w-0 pr-4'>
                                        <label className='text-sm font-medium text-neutral-200 block mb-1'>
                                            创建备份
                                        </label>
                                        <p className='text-xs text-neutral-400 leading-relaxed'>
                                            {backupLimit !== 0 && (backupLimit === null || (backups?.backupCount || 0) < backupLimit)
                                                ? '在应用更改前自动创建备份'
                                                : backupLimit === 0
                                                    ? '此服务器已禁用备份'
                                                    : '已达到备份限制'}
                                        </p>
                                    </div>
                                    <div className='flex-shrink-0'>
                                        <Switch
                                            checked={shouldBackup}
                                            onCheckedChange={setShouldBackup}
                                            disabled={backupLimit === 0 || (backupLimit !== null && (backups?.backupCount || 0) >= backupLimit)}
                                        />
                                    </div>
                                </div>

                                <div className='flex items-center justify-between p-4 bg-[#ffffff08] border border-[#ffffff12] rounded-lg hover:border-[#ffffff20] transition-colors'>
                                    <div className='flex-1 min-w-0 pr-4'>
                                        <label className='text-sm font-medium text-neutral-200 block mb-1'>
                                            清除文件
                                        </label>
                                        <p className='text-xs text-neutral-400 leading-relaxed'>
                                            在安装新软件前删除所有文件
                                        </p>
                                    </div>
                                    <div className='flex-shrink-0'>
                                        <Switch checked={shouldWipe} onCheckedChange={setShouldWipe} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className='flex flex-col sm:flex-row justify-center gap-3 pt-4'>
                    <ActionButton
                        variant='secondary'
                        onClick={() => setCurrentStep('select-software')}
                        className='w-full sm:w-auto'
                    >
                        返回软件
                    </ActionButton>
                    <ActionButton
                        variant='primary'
                        onClick={proceedToReview}
                        disabled={!eggPreview || isLoading}
                        className='w-full sm:w-auto'
                    >
                        {isLoading && <Spinner size='small' />}
                        审查更改
                    </ActionButton>
                </div>
            </TitledGreyBox>
        </div>
    );

    const renderReview = () => (
        <div className='space-y-6'>
            <TitledGreyBox title='审查更改'>
                {selectedEgg && eggPreview && (
                    <div className='space-y-6'>
                        {/* Summary */}
                        <div className='p-4 bg-[#ffffff08] border border-[#ffffff12] rounded-lg'>
                            <h3 className='text-lg font-semibold text-neutral-200 mb-4'>更改摘要</h3>
                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm'>
                                <div>
                                    <span className='text-neutral-400'>从:</span>
                                    <div className='text-neutral-200 font-medium'>
                                        {currentEggName || '无软件'}
                                    </div>
                                </div>
                                <div>
                                    <span className='text-neutral-400'>到:</span>
                                    <div className='text-brand font-medium'>{selectedEgg.attributes.name}</div>
                                </div>
                                <div>
                                    <span className='text-neutral-400'>类别:</span>
                                    <div className='text-neutral-200 font-medium'>{selectedNest?.attributes.name}</div>
                                </div>
                                <div>
                                    <span className='text-neutral-400'>Docker 镜像:</span>
                                    <div className='text-neutral-200 font-medium'>
                                        {selectedDockerImage || '默认'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 启动命令审查 */}
                        <div className='p-4 bg-[#ffffff08] border border-[#ffffff12] rounded-lg'>
                            <h3 className='text-lg font-semibold text-neutral-200 mb-4'>启动配置</h3>
                            <div className='space-y-3'>
                                <div>
                                    <span className='text-neutral-400 text-sm'>启动命令:</span>
                                    <div className='mt-1 p-3 bg-[#ffffff08] border border-[#ffffff12] rounded-lg font-mono text-sm text-neutral-200 whitespace-pre-wrap'>
                                        {customStartup || eggPreview.egg.startup}
                                    </div>
                                </div>
                                <div>
                                    <span className='text-neutral-400 text-sm'>Docker 镜像:</span>
                                    <div className='mt-1 p-3 bg-[#ffffff08] border border-[#ffffff12] rounded-lg text-sm text-neutral-200'>
                                        {selectedDockerImage || '默认镜像'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 配置审查 */}
                        {eggPreview.variables.length > 0 && (
                            <div className='p-4 bg-[#ffffff08] border border-[#ffffff12] rounded-lg'>
                                <h3 className='text-lg font-semibold text-neutral-200 mb-4'>变量配置</h3>
                                <div className='space-y-2'>
                                    {eggPreview.variables.map((variable) => (
                                        <div
                                            key={variable.env_variable}
                                            className='flex justify-between items-center py-2 px-3 bg-[#ffffff08] rounded-lg'
                                        >
                                            <div>
                                                <span className='text-neutral-200 font-medium'>{variable.name}</span>
                                                <span className='text-neutral-500 text-sm ml-2 font-mono'>
                                                    ({variable.env_variable})
                                                </span>
                                            </div>
                                            <div className='text-brand font-mono text-sm'>
                                                {pendingVariables[variable.env_variable] ||
                                                    variable.default_value ||
                                                    '未设置'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 安全选项审查 */}
                        <div className='p-4 bg-[#ffffff08] border border-[#ffffff12] rounded-lg'>
                            <h3 className='text-lg font-semibold text-neutral-200 mb-4'>安全选项审查</h3>
                            <div className='space-y-2'>
                                <div className='flex justify-between items-center py-2 px-3 bg-[#ffffff08] rounded-lg'>
                                    <span className='text-neutral-200'>创建备份</span>
                                    <span className={shouldBackup ? 'text-green-400' : 'text-neutral-400'}>
                                        {shouldBackup ? '是' : '否'}
                                    </span>
                                </div>
                                <div className='flex justify-between items-center py-2 px-3 bg-[#ffffff08] rounded-lg'>
                                    <span className='text-neutral-200'>清除文件</span>
                                    <span className={shouldWipe ? 'text-amber-400' : 'text-neutral-400'}>
                                        {shouldWipe ? '是' : '否'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Subdomain Warnings */}
                        {eggPreview.warnings && eggPreview.warnings.length > 0 && (
                            <div className='space-y-3'>
                                {eggPreview.warnings.map((warning, index) => (
                                    <div
                                        key={index}
                                        className={`p-4 border rounded-lg ${
                                            warning.severity === 'error'
                                                ? 'bg-red-500/10 border-red-500/20'
                                                : 'bg-amber-500/10 border-amber-500/20'
                                        }`}
                                    >
                                        <div className='flex items-start gap-3'>
                                            <HugeIconsAlert
                                                fill='currentColor'
                                                className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                                                    warning.severity === 'error' ? 'text-red-400' : 'text-amber-400'
                                                }`}
                                            />
                                            <div>
                                                <h4
                                                    className={`font-semibold mb-2 ${
                                                        warning.severity === 'error' ? 'text-red-400' : 'text-amber-400'
                                                    }`}
                                                >
                                                    {warning.type === 'subdomain_incompatible'
                                                        ? '子域名将被删除'
                                                        : '警告'}
                                                </h4>
                                                <p className='text-sm text-neutral-300'>{warning.message}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* General Warning */}
                        <div className='p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg'>
                            <div className='flex items-start gap-3'>
                                <HugeIconsAlert
                                    fill='currentColor'
                                    className='w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5'
                                />
                                <div>
                                    <h4 className='text-amber-400 font-semibold mb-2'>这将:</h4>
                                    <ul className='text-sm text-neutral-300'>
                                        <li>• 停止并重新安装您的服务器</li>
                                        <li>• 需要几分钟完成</li>
                                        <li>• 修改和删除一些文件</li>
                                    </ul>
                                    <span className='text-sm font-bold mt-4'>
                                        请确保在继续之前备份重要数据。
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className='flex flex-col sm:flex-row justify-center gap-3 pt-4'>
                    <ActionButton
                        variant='secondary'
                        onClick={() => setCurrentStep('configure')}
                        className='w-full sm:w-auto'
                    >
                        返回配置
                    </ActionButton>
                    <ActionButton
                        variant='primary'
                        onClick={applyChanges}
                        disabled={isLoading}
                        className='w-full sm:w-auto'
                    >
                        {isLoading && <Spinner size='small' />}
                        应用更改
                    </ActionButton>
                </div>
            </TitledGreyBox>
        </div>
    );

    // Show loading state if server data is not available
    if (!serverData) {
        return (
            <ServerContentBlock title='软件管理'>
                <div className='flex items-center justify-center h-64'>
                    <div className='flex flex-col items-center text-center'>
                        <Spinner size='large' />
                        <p className='text-neutral-400 mt-4'>加载服务器信息中...</p>
                    </div>
                </div>
            </ServerContentBlock>
        );
    }

    return (
        <ServerContentBlock title='软件管理'>
            <div className='space-y-6'>
                <MainPageHeader direction='column' title='软件管理'>
                    <p className='text-neutral-400 leading-relaxed'>
使用我们的引导式配置向导更改您的服务器游戏或软件
                    </p>
                </MainPageHeader>

                {/* 进度指示器 */}
                {currentStep !== 'overview' && (
                    <div className='p-4 bg-[#ffffff08] border border-[#ffffff12] rounded-lg'>
                        <div className='flex items-center justify-between mb-2'>
                            <span className='text-sm font-medium text-neutral-200 capitalize'>
                                {currentStep.replace('-', ' ')}
                            </span>
                            <span className='text-sm text-neutral-400'>
                                第{' '}
                                {['overview', 'select-game', 'select-software', 'configure', 'review'].indexOf(
                                    currentStep,
                                ) + 1}{' '}
                                步，共 5 步
                            </span>
                        </div>
                        <div className='w-full bg-[#ffffff12] rounded-full h-2'>
                            <div
                                className='bg-brand h-2 rounded-full transition-all duration-300'
                                style={{
                                    width: `${(['overview', 'select-game', 'select-software', 'configure', 'review'].indexOf(currentStep) / 4) * 100}%`,
                                }}
                            ></div>
                        </div>
                    </div>
                )}

                {/* 步骤内容 */}
                {currentStep === 'overview' && renderOverview()}
                {currentStep === 'select-game' && renderGameSelection()}
                {currentStep === 'select-software' && renderSoftwareSelection()}
                {currentStep === 'configure' && renderConfiguration()}
                {currentStep === 'review' && renderReview()}
            </div>

            {/* 清除文件 Confirmation Modal */}
            <ConfirmationModal
                title='不备份就清除所有文件？'
                buttonText={wipeCountdown > 0 ? `是的，清除文件 (${wipeCountdown}s)` : '是的，清除文件'}
                visible={showWipeConfirmation}
                onConfirmed={handleWipeConfirm}
                onModalDismissed={() => setShowWipeConfirmation(false)}
                disabled={wipeCountdown > 0 && !shiftPressed}
                loading={wipeLoading}
            >
                <div className='space-y-4'>
                    <div className='flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg'>
                        <HugeIconsAlert fill='currentColor' className='w-5 h-5 text-red-400 flex-shrink-0 mt-0.5' />
                        <div>
                            <h4 className='text-red-400 font-semibold mb-2'>危险：未选择备份</h4>
                            <p className='text-sm text-neutral-300'>
                                您已选择清除所有文件 <strong>而不创建备份</strong>。此操作将 <strong>永久删除所有文件</strong> 在您的服务器上且无法撤销。
                            </p>
                        </div>
                    </div>
                    <div className='text-sm text-neutral-300 space-y-2'>
                        <p>
                            <strong>将发生的情况：</strong>
                        </p>
                        <ul className='list-disc list-inside space-y-1 ml-4'>
                            <li>所有服务器文件将被永久删除</li>
                            <li>您的服务器将停止并重新安装</li>
                            <li>任何自定义配置或数据都将丢失</li>
                            <li>此操作无法逆转</li>
                        </ul>
                    </div>
                    <p className='text-sm text-neutral-300'>
                        您确定要在没有备份的情况下继续吗？
                    </p>
                </div>
            </ConfirmationModal>

            {/* Operation Progress Modal */}
            <OperationProgressModal
                visible={showOperationModal}
                operationId={currentOperationId}
                operationType='软件更改'
                onClose={closeOperationModal}
                onComplete={handleOperationComplete}
                onError={handleOperationError}
            />
        </ServerContentBlock>
    );
};

export default SoftwareContainer;
