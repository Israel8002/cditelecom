import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Network } from 'lucide-react';
import Input from '../components/Input';
import Select from '../components/Select';
import Button from '../components/Button';
import { cities } from '../catalogs/cities';
import { getUnitsByCity } from '../services/catalog.service';
import { useUserStore } from '../stores/user.store';
import { logEvent, LOG } from '../services/log.service';

const schema = z.object({
  nombre: z.string().trim().refine((v) => v.split(/\s+/).filter(Boolean).length >= 2, 'Ingresa nombre y apellido'),
  matricula: z.string().regex(/^\d{4,}$/, 'Solo números (mínimo 4 dígitos)'),
  correo: z.string().email('Correo no válido'),
  celular: z.string().regex(/^\d{10}$/, 'Debe tener 10 dígitos'),
  ciudad: z.string().min(1, 'Selecciona una ciudad'),
  unidad: z.string().min(1, 'Selecciona una unidad'),
});

export default function Register() {
  const navigate = useNavigate();
  const save = useUserStore((s) => s.save);
  const [form, setForm] = useState({ nombre: '', matricula: '', correo: '', celular: '', ciudad: '', unidad: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v, ...(k === 'ciudad' ? { unidad: '' } : {}) }));
  const unitOptions = form.ciudad
    ? getUnitsByCity(form.ciudad).map((u) => ({ value: String(u.id), label: `${u.nombre} (ID ${u.id})` }))
    : [];

  const onSubmit = async () => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const errs = {};
      parsed.error.issues.forEach((i) => { errs[i.path[0]] = i.message; });
      setErrors(errs);
      return;
    }
    setErrors({});
    setSaving(true);
    await save({ ...form, unidad: Number(form.unidad) });
    await logEvent(LOG.REGISTRO, form.matricula);
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="app-shell px-6 pt-10">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="h-16 w-16 rounded-[20px] bg-primary flex items-center justify-center mb-6">
          <Network size={32} className="text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold" style={{ fontWeight: 700 }}>Registro inicial</h1>
        <p className="text-[hsl(var(--muted-foreground))] mt-2 mb-8">
          Solo se realiza una vez. Tus datos se guardan localmente en este dispositivo.
        </p>

        <div className="flex flex-col gap-4">
          <Input label="Nombre completo" value={form.nombre} onChange={(v) => set('nombre', v)} error={errors.nombre} testId="reg-nombre" placeholder="Nombre y apellidos" />
          <Input label="Matrícula" value={form.matricula} onChange={(v) => set('matricula', v)} inputMode="numeric" error={errors.matricula} testId="reg-matricula" placeholder="Solo números" />
          <Input label="Correo electrónico" value={form.correo} onChange={(v) => set('correo', v)} type="email" error={errors.correo} testId="reg-correo" placeholder="correo@imss.gob.mx" />
          <Input label="Celular WhatsApp" value={form.celular} onChange={(v) => set('celular', v)} inputMode="numeric" maxLength={10} error={errors.celular} testId="reg-celular" placeholder="10 dígitos" />
          <Select label="Ciudad" value={form.ciudad} onChange={(v) => set('ciudad', v)} error={errors.ciudad} testId="reg-ciudad"
            options={cities.map((c) => ({ value: c.id, label: c.nombre }))} />
          <Select label="Unidad" value={form.unidad} onChange={(v) => set('unidad', v)} disabled={!form.ciudad} error={errors.unidad} testId="reg-unidad"
            options={unitOptions} placeholder={form.ciudad ? 'Selecciona...' : 'Primero elige ciudad'} />
        </div>

        <div className="mt-8 mb-10">
          <Button onClick={onSubmit} loading={saving} testId="reg-submit-btn">Comenzar</Button>
        </div>
      </motion.div>
    </div>
  );
}
