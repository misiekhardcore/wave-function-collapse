import type { ReactNode } from 'react';

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

type PanelProps = {
  title: string;
  description?: string;
  /** Optional control rendered on the right side of the panel header. */
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

/**
 * A titled card that groups related controls or output. The title is exposed as
 * a level-2 heading so the page keeps a document outline under the page `h1`.
 */
export function Panel({
  title,
  description,
  action,
  children,
  className,
  contentClassName,
}: PanelProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle role="heading" aria-level={2}>
          {title}
        </CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
        {action ? <CardAction>{action}</CardAction> : null}
      </CardHeader>
      <CardContent className={cn('flex flex-col gap-4', contentClassName)}>{children}</CardContent>
    </Card>
  );
}
