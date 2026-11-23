import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '../../../shared/components/Input';
import Button from '../../../shared/components/Button';
import { loginSchema, type LoginFormData } from '../schemas/auth.schema';
import { useLogin } from '../hooks/useLogin';

export default function LoginForm({ onSwitch }: { onSwitch: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const login = useLogin();

  return (
    <form
      onSubmit={handleSubmit((data) => login.mutate(data))}
      className="flex flex-col gap-4"
    >
      <Input
        id="l-email"
        label="Email"
        type="email"
        placeholder="nombre@email.com"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />
      <Input
        id="l-pass"
        label="Contrasena"
        type="password"
        placeholder="Tu contrasena"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register('password')}
      />

      <div className="flex items-center justify-between flex-wrap gap-2 text-sm">
        <label className="flex items-center gap-2 text-text min-h-11">
          <input
            type="checkbox"
            className="w-[18px] h-[18px] accent-primary"
          />
          Recordarme
        </label>
        <a href="#" className="font-semibold text-primary no-underline">
          Olvidaste tu contrasena?
        </a>
      </div>

      {login.error && (
        <p className="text-sm text-danger text-center">
          {(login.error as any)?.response?.data?.message ??
            'Credenciales invalidas'}
        </p>
      )}

      <Button type="submit" loading={login.isPending}>
        Ingresar
      </Button>

      <p className="m-0 text-center text-sm text-text-secondary">
        No tenes cuenta?{' '}
        <button
          type="button"
          onClick={onSwitch}
          className="bg-transparent border-0 p-0 text-primary font-semibold text-sm cursor-pointer min-h-11"
        >
          Registrate
        </button>
      </p>
    </form>
  );
}
