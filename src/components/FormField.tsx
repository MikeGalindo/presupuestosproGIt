// Campo de formulario accesible (label + control + error/ayuda).

import type { ChangeEvent, ReactNode } from 'react';

interface BaseProps {
  id: string;
  label: string;
  error?: string;
  ayuda?: string;
  obligatorio?: boolean;
  disabled?: boolean;
}

export interface FormFieldProps extends BaseProps {
  tipo?: 'text' | 'email' | 'tel' | 'number' | 'date';
  valor: string;
  onChange: (valor: string) => void;
  placeholder?: string;
  paso?: string;
  minimo?: string;
  autoFocus?: boolean;
}

export function FormField({
  id,
  label,
  tipo = 'text',
  valor,
  onChange,
  error,
  ayuda,
  obligatorio,
  disabled,
  placeholder,
  paso,
  minimo,
  autoFocus,
}: FormFieldProps) {
  const idError = `${id}-error`;
  const idAyuda = `${id}-ayuda`;
  const descrito = [error ? idError : null, ayuda ? idAyuda : null].filter(Boolean).join(' ') || undefined;

  const manejar = (evento: ChangeEvent<HTMLInputElement>) => onChange(evento.target.value);

  return (
    <div className={`campo${error ? ' campo--error' : ''}`}>
      <label htmlFor={id}>
        {label}
        {obligatorio ? ' *' : ''}
      </label>
      <input
        id={id}
        name={id}
        type={tipo}
        value={valor}
        onChange={manejar}
        placeholder={placeholder}
        disabled={disabled}
        step={paso}
        min={minimo}
        required={obligatorio}
        aria-invalid={error ? true : undefined}
        aria-describedby={descrito}
        autoFocus={autoFocus}
      />
      {ayuda ? (
        <span id={idAyuda} className="campo__ayuda">
          {ayuda}
        </span>
      ) : null}
      {error ? (
        <span id={idError} className="campo__error" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}

export interface SelectFieldProps extends BaseProps {
  valor: string;
  onChange: (valor: string) => void;
  children: ReactNode;
  placeholderOpcion?: string;
}

export function SelectField({
  id,
  label,
  valor,
  onChange,
  error,
  ayuda,
  obligatorio,
  disabled,
  children,
  placeholderOpcion,
}: SelectFieldProps) {
  const idError = `${id}-error`;
  const idAyuda = `${id}-ayuda`;
  const descrito = [error ? idError : null, ayuda ? idAyuda : null].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`campo${error ? ' campo--error' : ''}`}>
      <label htmlFor={id}>
        {label}
        {obligatorio ? ' *' : ''}
      </label>
      <select
        id={id}
        name={id}
        value={valor}
        onChange={(evento) => onChange(evento.target.value)}
        disabled={disabled}
        required={obligatorio}
        aria-invalid={error ? true : undefined}
        aria-describedby={descrito}
      >
        {placeholderOpcion ? <option value="">{placeholderOpcion}</option> : null}
        {children}
      </select>
      {ayuda ? (
        <span id={idAyuda} className="campo__ayuda">
          {ayuda}
        </span>
      ) : null}
      {error ? (
        <span id={idError} className="campo__error" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}

export interface TextAreaFieldProps extends BaseProps {
  valor: string;
  onChange: (valor: string) => void;
  filas?: number;
  placeholder?: string;
}

export function TextAreaField({
  id,
  label,
  valor,
  onChange,
  error,
  ayuda,
  obligatorio,
  disabled,
  filas = 3,
  placeholder,
}: TextAreaFieldProps) {
  const idError = `${id}-error`;
  const idAyuda = `${id}-ayuda`;
  const descrito = [error ? idError : null, ayuda ? idAyuda : null].filter(Boolean).join(' ') || undefined;
  return (
    <div className={`campo${error ? ' campo--error' : ''}`}>
      <label htmlFor={id}>
        {label}
        {obligatorio ? ' *' : ''}
      </label>
      <textarea
        id={id}
        name={id}
        value={valor}
        rows={filas}
        onChange={(evento) => onChange(evento.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        required={obligatorio}
        aria-invalid={error ? true : undefined}
        aria-describedby={descrito}
      />
      {ayuda ? (
        <span id={idAyuda} className="campo__ayuda">
          {ayuda}
        </span>
      ) : null}
      {error ? (
        <span id={idError} className="campo__error" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}
