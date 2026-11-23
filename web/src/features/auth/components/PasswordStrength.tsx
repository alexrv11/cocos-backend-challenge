function getStrength(password: string): number {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

export default function PasswordStrength({ password }: { password: string }) {
  const strength = getStrength(password);

  return (
    <div className="flex flex-col gap-1 mt-1">
      <div className="grid grid-cols-4 gap-1" aria-hidden="true">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`h-1 rounded-sm ${
              strength >= level ? 'bg-success' : 'bg-border'
            }`}
          />
        ))}
      </div>
      <span className="text-[13px] text-text-secondary">
        Minimo 8 caracteres, con una mayuscula y un numero.
      </span>
    </div>
  );
}
