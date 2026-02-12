import clsx from 'clsx';
import copy from 'copy-to-clipboard';
import { useEffect, useState } from 'react';
import * as React from 'react';
import { toast } from 'sonner';

interface CopyOnClickProps {
    text: string | number | null | undefined;
    showInNotification?: boolean;
    children: React.ReactNode;
}

const CopyOnClick = ({ text, children, showInNotification }: CopyOnClickProps) => {
    const [copied, setCopied] = useState(false);
    let truncatedText;
    if (showInNotification == false) {
        truncatedText = '';
    } else {
        const length = 80;
        const stringText = String(text);
        truncatedText = stringText.length > length ? `"${stringText.substring(0, length - 3)}..."` : `"${stringText}"`;
    }

    useEffect(() => {
        if (!copied) return;
        toast(`已复制 ${truncatedText} 到剪贴板。`);

        const timeout = setTimeout(() => {
            setCopied(false);
        }, 2500);

        return () => {
            clearTimeout(timeout);
        };
    }, [copied]);

    if (!React.isValidElement(children)) {
        throw new Error('传递给 <CopyOnClick/> 的组件必须是有效的 React 元素。');
    }

    const child = !text
        ? React.Children.only(children)
        : React.cloneElement(React.Children.only(children), {
              // @ts-expect-error - Props type inference issue with React.cloneElement
              className: clsx(children.props.className || '', 'cursor-pointer'),
              onClick: (e: React.MouseEvent<HTMLElement>) => {
                  copy(String(text));
                  setCopied(true);
                  if (typeof children.props.onClick === 'function') {
                      children.props.onClick(e);
                  }
              },
          });

    return <>{child}</>;
};

export default CopyOnClick;
