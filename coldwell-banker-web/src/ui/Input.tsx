// src/ui/Input.tsx
import type { InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react';
import styles from './Input.module.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  icon?: ReactNode;
  label?: string;
}

export function Input({
  error,
  icon,
  label,
  className = '',
  ...props
}: InputProps) {
  const wrapperClass = `${styles.wrapper} ${className}`;
  const inputClass = `${styles.input} ${error ? styles.error : ''} ${icon ? styles.withIcon : ''}`;

  return (
    <div className={wrapperClass}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.inputContainer}>
        {icon && <div className={styles.icon}>{icon}</div>}
        <input className={inputClass} {...props} />
      </div>
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
}

export function Textarea({
  error,
  label,
  className = '',
  ...props
}: TextareaProps) {
  const wrapperClass = `${styles.wrapper} ${className}`;
  const textareaClass = `${styles.textarea} ${error ? styles.error : ''}`;

  return (
    <div className={wrapperClass}>
      {label && <label className={styles.label}>{label}</label>}
      <textarea className={textareaClass} {...props} />
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
}

export default Input;
