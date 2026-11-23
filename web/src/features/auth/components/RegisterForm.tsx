import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '../../../shared/components/Input';
import Button from '../../../shared/components/Button';
import PasswordStrength from './PasswordStrength';
import {
  registerSchema,
  formatCuil,
  type RegisterFormData,
} from '../schemas/auth.schema';
import { useRegister } from '../hooks/useRegister';

export default function RegisterForm({ onSwitch }: { onSwitch: () => void }) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { terms: false as unknown as true },
  });

  const reg = useRegister();
  const password = watch('password', '');

  return (
    <form
      onSubmit={handleSubmit((data) => reg.mutate(data))}
      className="flex flex-col gap-4"
    >
      <div className="grid grid-cols-2 gap-3">
        <Input
          id="r-name"
          label="Nombre"
          type="text"
          placeholder="Juana"
          autoComplete="given-name"
          error={errors.firstName?.message}
          {...register('firstName')}
        />
        <Input
          id="r-last"
          label="Apellido"
          type="text"
          placeholder="Perez"
          autoComplete="family-name"
          error={errors.lastName?.message}
          {...register('lastName')}
        />
      </div>

      <Input
        id="r-email"
        label="Email"
        type="email"
        placeholder="nombre@email.com"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />

      <Input
        id="r-cuil"
        label="CUIL / CUIT"
        type="text"
        inputMode="numeric"
        placeholder="20-12345678-9"
        error={errors.cuil?.message}
        {...register('cuil', {
          onChange: (e) => {
            setValue('cuil', formatCuil(e.target.value), {
              shouldValidate: false,
            });
          },
        })}
      />

      <div className="flex flex-col gap-1.5">
        <Input
          id="r-pass"
          label="Contrasena"
          type="password"
          placeholder="Crea una contrasena"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <PasswordStrength password={password} />
      </div>

      <label className="flex items-start gap-2.5 text-sm text-text-secondary leading-relaxed">
        <input
          type="checkbox"
          className="w-[18px] h-[18px] mt-0.5 accent-primary shrink-0"
          {...register('terms')}
        />
        <span>
          Acepto los{' '}
          <a href="#" className="text-primary">
            Terminos y condiciones
          </a>{' '}
          y la{' '}
          <a href="#" className="text-primary">
            Politica de privacidad
          </a>
          .
        </span>
      </label>
      {errors.terms && (
        <span className="text-xs text-danger -mt-2">
          {errors.terms.message}
        </span>
      )}

      {reg.error && (
        <p className="text-sm text-danger text-center">
          {(reg.error as any)?.response?.data?.message ??
            'Error al crear la cuenta'}
        </p>
      )}

      <Button type="submit" loading={reg.isPending}>
        Crear cuenta
      </Button>

      <p className="m-0 text-center text-sm text-text-secondary">
        Ya tenes cuenta?{' '}
        <button
          type="button"
          onClick={onSwitch}
          className="bg-transparent border-0 p-0 text-primary font-semibold text-sm cursor-pointer min-h-11"
        >
          Ingresa
        </button>
      </p>
    </form>
  );
}
