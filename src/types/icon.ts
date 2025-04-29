import type { SVGProps } from 'react';
import type { ReactElement } from 'react';

export type IconComponent = ({ color, ...props }: SVGProps<SVGSVGElement>) => ReactElement;

export interface IconProps extends SVGProps<SVGSVGElement> {
  as?: IconComponent;
} 