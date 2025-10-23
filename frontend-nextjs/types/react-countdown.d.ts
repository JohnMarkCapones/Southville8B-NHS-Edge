/**
 * Type declarations for react-countdown
 *
 * Provides basic types for the Countdown component
 */

declare module 'react-countdown' {
  import { ComponentType } from 'react';

  export interface CountdownRenderProps {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    milliseconds: number;
    completed: boolean;
    total: number;
  }

  export interface CountdownProps {
    date: number | Date | string;
    renderer?: (props: CountdownRenderProps) => React.ReactNode;
    onComplete?: () => void;
    onTick?: (props: CountdownRenderProps) => void;
    precision?: number;
    intervalDelay?: number;
    controlled?: boolean;
    autoStart?: boolean;
    overtime?: boolean;
    children?: React.ReactNode;
  }

  const Countdown: ComponentType<CountdownProps>;
  export default Countdown;
}
