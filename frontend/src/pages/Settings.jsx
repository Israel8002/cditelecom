import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { User, Info, Layers, BadgeInfo } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Input from '../components/Input';
import Select from '../components/Select';
import Button from '../components/Button';
import BottomNavigation from '../components/BottomNavigation';
import { useUserStore } from '../stores/user.store';
import { cities } from '../catalogs/cities';
import { getUnitsByCity, getCatalogStats } from '../services/catalog.service';
import { countEvaluations, countPhotos, countBackups, getStorageEstimate } from '../services/storage.service';
import { formatBytes } from '../services/format';
import { appConfig } from '../catalogs/appConfig';

export default function Settings() {
  const navigate = useNavigate();
  const user = useUserStore((s) => s.user);
  const loadUser = useUserStore((s) => s.load);
  const save = useUserStore((s) => s.save);
  const [form, setForm] = useState(null);
  const [sys, setSys] = useState({ evals: 0, fotos: 0, backups: 0, usage: 0 });
  const cat = getCatalogStats();

  useEffect(() => {
    if (!user) loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (user) setForm({ nombre: user.nombre, correo: user.correo, celular: user.celular, ciudad: user.ciudad, unidad: String(user.unidad) });
  }, [user]);

  useEffect(() => {
    (async () => {
      const est = await getStorageEstimate();
      setSys({ evals: await countEvaluations(), fotos: await countPhotos(), backups: await countBackups(), usage: est.usage });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!form) return null;
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v, ...(k === 'ciudad' ? { unidad: '' } : {}) }));
  const unitOptions = getUnitsByCity(form.ciudad).map((u) => ({ value: String(u.id), label: `${u.nombre} (ID ${u.id})` }));

  const onSave = async () => {
    await save({ ...form, unidad: Number(form.unidad) });
    toast.success('Datos actualizados');
  };

  return (
    <div className="app-shell">
      <PageHeader title="Configuración" onBack={() => navigate('/dashboard')} />
      <div className="px-6 flex flex-col gap-4">
        {/* Datos del evaluador */}
        <Card>
          <p className="font-semibold mb-4 flex items-center gap-2" style={{ fontWeight: 600 }}><User size={18} />Datos del evaluador</p>
          <div className="flex flex-col gap-3">
            <Input label="Matrícula (permanente)" value={user.matricula} readOnly testId="set-matricula" />
            <Input label="Nombre completo" value={form.nombre} onChange={(v) => set('nombre', v)} testId="set-nombre" />
            <Input label="Correo" value={form.correo} onChange={(v) => set('correo', v)} type="email" testId="set-correo" />
            <Input label="WhatsApp" value={form.celular} onChange={(v) => set('celular', v)} inputMode="numeric" maxLength={10} testId="set-celular" />
            <Select label="Ciudad" value={form.ciudad} onChange={(v) => set('ciudad', v)} options={cities.map((c) => ({ value: c.id, label: c.nombre }))} testId="set-ciudad" />
            <Select label="Unidad" value={form.unidad} onChange={(v) => set('unidad', v)} options={unitOptions} testId="set-unidad" />
            <Button onClick={onSave} testId="set-save-btn">Guardar cambios</Button>
          </div>
        </Card>

        {/* Información del sistema */}
        <Card>
          <p className="font-semibold mb-3 flex items-center gap-2" style={{ fontWeight: 600 }}><Info size={18} />Información del sistema</p>
          <Rows rows={[
            ['Versión', appConfig.version], ['Framework', 'React 19'], ['Almacenamiento', 'IndexedDB'],
            ['Espacio utilizado', formatBytes(sys.usage)], ['Evaluaciones', sys.evals],
            ['Fotografías', sys.fotos], ['Respaldos (PDF/JSON)', sys.backups],
          ]} />
        </Card>

        {/* Catálogos */}
        <Card>
          <p className="font-semibold mb-3 flex items-center gap-2" style={{ fontWeight: 600 }}><Layers size={18} />Catálogos</p>
          <Rows rows={[['Ciudades', cat.ciudades], ['Unidades', cat.unidades], ['Cuartos', cat.cuartos], ['Preguntas', cat.preguntas]]} />
        </Card>

        {/* Acerca de */}
        <Card>
          <p className="font-semibold mb-3 flex items-center gap-2" style={{ fontWeight: 600 }}><BadgeInfo size={18} />Acerca de</p>
          <p className="text-sm">{appConfig.appName}</p>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Versión {appConfig.version}</p>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-3">{appConfig.author}</p>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{appConfig.institution}</p>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{appConfig.department}</p>
          <div className="border-t border-[hsl(var(--border))] mt-4 pt-3 flex flex-col gap-1">
            <p className="text-xs text-[hsl(var(--muted-foreground))]">Copyright &copy; {new Date().getFullYear()} LSC Israel Díaz Serrano</p>
            <p className="text-[11px] text-[hsl(var(--muted-foreground))] leading-normal mt-1">Este programa es software libre: Tu puedes distribuir bajo los terminos de la licencia de GNU General Public License v3.0.</p>
          </div>
        </Card>
      </div>
      <BottomNavigation />
    </div>
  );
}

function Rows({ rows }) {
  return (
    <div className="flex flex-col divide-y divide-[hsl(var(--border))]">
      {rows.map(([k, v]) => (
        <div key={k} className="flex justify-between gap-4 py-2.5 first:pt-0">
          <span className="text-[hsl(var(--muted-foreground))] text-sm">{k}</span>
          <span className="font-medium text-right text-sm" style={{ fontWeight: 500 }}>{v}</span>
        </div>
      ))}
    </div>
  );
}
