// Perfil del emisor — FR-001. Un único registro con logo opcional.

import { useEffect, useState, type ChangeEvent } from 'react';
import { AvisoError, Cargando, FormField, TextAreaField } from '../../components';
import { useStore } from '../../data/store';
import { validarEmisor } from '../../domain/validation';
import type { PerfilEmisorInput } from '../../domain/types';
import { ACEPTA_LOGO, logoCompatibleConPdf, prepararLogo, TAMANO_MAXIMO_LOGO } from '../../lib/logo';

const formularioVacio: PerfilEmisorInput = {
  nombre: '',
  razonSocial: '',
  rfc: '',
  correo: '',
  telefono: '',
  direccion: '',
  logo: undefined,
};

export function ProfilePage() {
  const { perfil, cargando, error, recargar, guardarPerfil } = useStore();
  const [formulario, setFormulario] = useState<PerfilEmisorInput>(formularioVacio);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (perfil) {
      setFormulario({
        nombre: perfil.nombre,
        razonSocial: perfil.razonSocial,
        rfc: perfil.rfc,
        correo: perfil.correo ?? '',
        telefono: perfil.telefono ?? '',
        direccion: perfil.direccion ?? '',
        logo: perfil.logo,
      });
    }
  }, [perfil]);

  const actualizar = (campo: keyof PerfilEmisorInput) => (valor: string) => {
    setFormulario((previo) => ({ ...previo, [campo]: valor }));
    setMensaje(null);
  };

  const alElegirLogo = async (evento: ChangeEvent<HTMLInputElement>) => {
    const archivo = evento.target.files?.[0];
    if (!archivo) return;
    if (archivo.size > TAMANO_MAXIMO_LOGO) {
      setErrores((previo) => ({ ...previo, logo: 'El logo no debe superar 1 MB.' }));
      return;
    }
    try {
      // Se normaliza a PNG para que @react-pdf/renderer pueda incrustarlo (SVG/WebP/GIF no son válidos).
      const logo = await prepararLogo(archivo);
      setFormulario((previo) => ({ ...previo, logo }));
      setErrores((previo) => {
        const { logo: _logo, ...resto } = previo;
        return resto;
      });
    } catch {
      setErrores((previo) => ({
        ...previo,
        logo: 'No se pudo procesar la imagen. Prueba con un archivo PNG o JPG.',
      }));
    }
  };

  const guardar = async () => {
    const validacion = validarEmisor(formulario);
    setErrores(validacion.errores);
    if (!validacion.valido) {
      setMensaje('Revisa los campos obligatorios del perfil.');
      return;
    }
    setGuardando(true);
    setMensaje(null);
    try {
      await guardarPerfil(formulario);
      setMensaje('Perfil guardado correctamente.');
    } catch (e) {
      setMensaje(e instanceof Error ? e.message : 'No se pudo guardar el perfil.');
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) return <Cargando mensaje="Cargando perfil…" />;
  if (error) return <AvisoError mensaje={error} onReintentar={() => void recargar()} />;

  return (
    <section>
      <h1>Mi perfil</h1>
      <p className="campo__ayuda">
        Estos datos aparecen en el PDF de tus presupuestos. El nombre, la razón social y el RFC son
        obligatorios.
      </p>

      <form
        className="tarjeta"
        onSubmit={(evento) => {
          evento.preventDefault();
          void guardar();
        }}
      >
        <div className="grid">
          <FormField id="nombre" label="Nombre" valor={formulario.nombre} onChange={actualizar('nombre')} obligatorio error={errores.nombre} />
          <FormField
            id="razonSocial"
            label="Razón social"
            valor={formulario.razonSocial}
            onChange={actualizar('razonSocial')}
            obligatorio
            error={errores.razonSocial}
          />
          <FormField id="rfc" label="RFC" valor={formulario.rfc} onChange={actualizar('rfc')} obligatorio error={errores.rfc} />
          <FormField id="correo" label="Correo" tipo="email" valor={formulario.correo ?? ''} onChange={actualizar('correo')} error={errores.correo} />
          <FormField id="telefono" label="Teléfono" tipo="tel" valor={formulario.telefono ?? ''} onChange={actualizar('telefono')} />
        </div>

        <TextAreaField id="direccion" label="Dirección" valor={formulario.direccion ?? ''} onChange={actualizar('direccion')} />

        <div className="campo">
          <label htmlFor="logo">Logo (PNG, JPG, SVG, WEBP o GIF, ≤ 1 MB)</label>
          <input id="logo" name="logo" type="file" accept={ACEPTA_LOGO} onChange={(evento) => void alElegirLogo(evento)} />
          {formulario.logo ? (
            <div>
              <img className="logo-vista" src={formulario.logo} alt="Vista previa del logo" />
              {!logoCompatibleConPdf(formulario.logo) ? (
                <span className="campo__error" role="alert">
                  Este logo no es compatible con el PDF. Vuelve a subirlo y se convertirá automáticamente.
                </span>
              ) : null}
              <div className="botonera">
                <button
                  type="button"
                  className="boton--secundario"
                  onClick={() => setFormulario((previo) => ({ ...previo, logo: undefined }))}
                >
                  Quitar logo
                </button>
              </div>
            </div>
          ) : (
            <span className="campo__ayuda">Si no cargas logo, el PDF se genera sin él.</span>
          )}
          {errores.logo ? (
            <span className="campo__error" role="alert">
              {errores.logo}
            </span>
          ) : null}
        </div>

        <div className="botonera">
          <button type="submit" disabled={guardando}>
            {guardando ? 'Guardando…' : 'Guardar perfil'}
          </button>
        </div>

        {mensaje ? (
          <p role="status" className="campo__ayuda">
            {mensaje}
          </p>
        ) : null}
      </form>
    </section>
  );
}
