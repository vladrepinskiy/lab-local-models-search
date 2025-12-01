import { styled } from 'goober';
import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  fullWidth?: boolean;
}

export const Button = ({
  variant = 'primary',
  fullWidth,
  ...props
}: ButtonProps) => {
  return <StyledButton variant={variant} fullWidth={fullWidth} {...props} />;
};

const StyledButton = styled('button')<{
  variant: 'primary' | 'secondary';
  fullWidth?: boolean;
}>`
  height: 40px;
  padding: 0 20px;
  border: 1px solid
    ${(props) => (props.variant === 'secondary' ? '#d0d0d0' : '#1a1a1a')};
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background: ${(props) =>
    props.variant === 'secondary' ? 'white' : '#1a1a1a'};
  color: ${(props) => (props.variant === 'secondary' ? '#1a1a1a' : 'white')};
  white-space: nowrap;
  width: ${(props) => (props.fullWidth ? '100%' : 'auto')};

  &:hover:not(:disabled) {
    background: ${(props) =>
      props.variant === 'secondary' ? '#f5f5f5' : '#333'};
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;
