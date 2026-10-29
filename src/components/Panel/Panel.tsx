import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@konopskidev/ui';
import type { ReactNode } from 'react';

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
 *
 * The design system's CardHeader is a column, so the row layout and the action
 * slot are composed here instead of relying on CardAction's grid placement.
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
      <CardHeader className="flex-row items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <CardTitle role="heading" aria-level={2}>
            {title}
          </CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </div>
        {action ? <CardAction className="self-start">{action}</CardAction> : null}
      </CardHeader>
      <CardContent className={cn('flex flex-col gap-4', contentClassName)}>{children}</CardContent>
    </Card>
  );
}
