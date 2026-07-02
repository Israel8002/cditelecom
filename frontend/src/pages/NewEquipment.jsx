import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Package, Save } from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Input from '../components/Input';
import Select from '../components/Select';
import Button from '../components/Button';
import { useUserStore } from '../stores/user.store';
import { useEquipmentStore } from '../stores/equipment.store';
import { getCities, getUnitsByCity, getRoomsByUnit, getUnitById, getRoomById } from '../services/catalog.service';
import { devicesCatalog } from '../catalogs/devices';
import { logEvent } from '../services/log.service';

export default function NewEquipment() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const user = useUserStore((s) => s.user);
  const loadUser = useUserStore((s) => s.load);
  const equipos = useEquipmentStore((s) => s.equipos);
  const loadAll = useEquipmentStore((s) => s.loadAll);
  const saveEquipo = useEquipmentStore((s) => s.save);

  // Ubicación form states
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');

  // Device form states
  const [tipo, setTipo] = useState('');
  const [marca, setMarca] = useState('');
  const [customMarca, setCustomMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [customModelo, setCustomModelo] = useState('');
  const [numeroSerie, setNumeroSerie] = useState('');
  const [estado, setEstado] = useState('Operativo');

  // Optional connectivity details
  const [puertosTotales, setPuertosTotales] = useState('');
  const [puertosOcupados, setPuertosOcupados] = useState('');
  const [macAddress, setMacAddress] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [observaciones, setObservaciones] = useState('');

  // Validation errors
  const [errors, setErrors] = useState({});

  // Initial load
  useEffect(() => {
    loadAll();
    if (!user) {
      loadUser().then((u) => {
        if (u) {
          setSelectedCity(u.ciudad || '');
          setSelectedUnit(u.unidad ? String(u.unidad) : '');
        }
      });
    } else {
      setSelectedCity(user.ciudad || '');
      setSelectedUnit(user.unidad ? String(user.unidad) : '');
    }
  }, [user, loadUser, loadAll]);

  // Populate edit fields if editing
  useEffect(() => {
    if (isEdit && equipos.length > 0) {
      const item = equipos.find((eq) => eq.id === id);
      if (item) {
        // Find city of the unit
        const unit = getUnitById(item.unitId);
        if (unit) {
          setSelectedCity(unit.cityId);
          setSelectedUnit(String(unit.id));
        }
        setSelectedRoom(item.roomId);
        setTipo(item.tipo);

        // Check if brand was custom
        const standardBrands = devicesCatalog.filter((d) => d.tipo === item.tipo).map((d) => d.marca);
        if (standardBrands.includes(item.marca)) {
          setMarca(item.marca);
        } else {
          setMarca('OTRO');
          setCustomMarca(item.marca);
        }

        // Check if model was custom
        const standardModels = devicesCatalog.filter((d) => d.tipo === item.tipo && d.marca === item.marca).map((d) => d.modelo);
        if (standardModels.includes(item.modelo)) {
          setModelo(item.modelo);
        } else {
          setModelo('OTRO');
          setCustomModelo(item.modelo);
        }

        setNumeroSerie(item.numeroSerie);
        setEstado(item.estado);
        setPuertosTotales(item.puertosTotales !== undefined && item.puertosTotales !== null ? String(item.puertosTotales) : '');
        setPuertosOcupados(item.puertosOcupados !== undefined && item.puertosOcupados !== null ? String(item.puertosOcupados) : '');
        setMacAddress(item.macAddress || '');
        setIpAddress(item.ipAddress || '');
        setObservaciones(item.observaciones || '');
      } else {
        toast.error('No se encontró el equipo para editar.');
        navigate('/inventario');
      }
    }
  }, [isEdit, id, equipos, navigate]);

  // Handle dropdown resets
  const handleCityChange = (city) => {
    setSelectedCity(city);
    setSelectedUnit('');
    setSelectedRoom('');
  };

  const handleUnitChange = (unit) => {
    setSelectedUnit(unit);
    setSelectedRoom('');
  };

  const handleTypeChange = (t) => {
    setTipo(t);
    setMarca('');
    setCustomMarca('');
    setModelo('');
    setCustomModelo('');
  };

  const handleBrandChange = (b) => {
    setMarca(b);
    setModelo('');
    setCustomModelo('');
    if (b !== 'OTRO') setCustomMarca('');
  };

  // Option lists
  const cityOptions = useMemo(() => {
    return getCities().map((c) => ({ value: c.id, label: c.nombre }));
  }, []);

  const unitOptions = useMemo(() => {
    if (!selectedCity) return [];
    return getUnitsByCity(selectedCity).map((u) => ({ value: String(u.id), label: u.nombre }));
  }, [selectedCity]);

  const roomOptions = useMemo(() => {
    if (!selectedUnit) return [];
    return getRoomsByUnit(Number(selectedUnit)).map((r) => ({ value: r.id, label: r.nombre }));
  }, [selectedUnit]);

  const typeOptions = [
    { value: 'CORE', label: 'CORE' },
    { value: 'DVR', label: 'DVR' },
    { value: 'MODEM', label: 'MODEM' },
    { value: 'NTU', label: 'NTU' },
    { value: 'PBX', label: 'PBX' },
    { value: 'ROUTER', label: 'ROUTER' },
    { value: 'SWITCH', label: 'SWITCH' },
    { value: 'UPS', label: 'UPS' }
  ];

  // Dynamically group brands (Standard + Custom existing in DB)
  const brandOptions = useMemo(() => {
    if (!tipo) return [];
    
    // Standard brands from catalog file
    const standard = Array.from(
      new Set(
        devicesCatalog
          .filter((d) => d.tipo === tipo)
          .map((d) => d.marca)
      )
    );

    // Custom brands from saved equipos
    const custom = Array.from(
      new Set(
        equipos
          .filter((eq) => eq.tipo === tipo && !devicesCatalog.some((d) => d.tipo === tipo && d.marca === eq.marca))
          .map((eq) => eq.marca)
      )
    );

    const combined = Array.from(new Set([...standard, ...custom])).sort();

    return [
      ...combined.map((b) => ({ value: b, label: b })),
      { value: 'OTRO', label: 'Otro (Agregar Personalizado)' }
    ];
  }, [tipo, equipos]);

  // Dynamically group models (Standard + Custom existing in DB)
  const modelOptions = useMemo(() => {
    if (!tipo || !marca || marca === 'OTRO') return [];

    // Standard models from catalog file
    const standard = Array.from(
      new Set(
        devicesCatalog
          .filter((d) => d.tipo === tipo && d.marca === marca)
          .map((d) => d.modelo)
      )
    );

    // Custom models from saved equipos
    const custom = Array.from(
      new Set(
        equipos
          .filter((eq) => eq.tipo === tipo && eq.marca === marca && !devicesCatalog.some((d) => d.tipo === tipo && d.marca === marca && d.modelo === eq.modelo))
          .map((eq) => eq.modelo)
      )
    );

    const combined = Array.from(new Set([...standard, ...custom])).sort();

    return [
      ...combined.map((m) => ({ value: m, label: m })),
      { value: 'OTRO', label: 'Otro (Agregar Personalizado)' }
    ];
  }, [tipo, marca, equipos]);

  const validate = () => {
    const errs = {};
    if (!selectedUnit) errs.unit = 'Selecciona la unidad.';
    if (!selectedRoom) errs.room = 'Selecciona el cuarto.';
    if (!tipo) errs.tipo = 'Selecciona el tipo de equipo.';
    
    if (!marca) errs.marca = 'Selecciona la marca.';
    else if (marca === 'OTRO' && !customMarca.trim()) errs.customMarca = 'Escribe la marca personalizada.';
    
    if (!modelo) errs.modelo = 'Selecciona el modelo.';
    else if (modelo === 'OTRO' && !customModelo.trim()) errs.customModelo = 'Escribe el modelo personalizado.';
    
    if (!numeroSerie.trim()) errs.numeroSerie = 'Ingresa el número de serie.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      toast.error('Por favor, completa los campos requeridos.');
      return;
    }

    const itemMarca = marca === 'OTRO' ? customMarca.trim().toUpperCase() : marca;
    const itemModelo = modelo === 'OTRO' ? customModelo.trim() : modelo;

    const data = {
      id: isEdit ? id : `EQ-${selectedRoom}-${Date.now()}`,
      unitId: Number(selectedUnit),
      roomId: selectedRoom,
      tipo,
      marca: itemMarca,
      modelo: itemModelo,
      numeroSerie: numeroSerie.trim().toUpperCase(),
      estado,
      puertosTotales: puertosTotales ? Number(puertosTotales) : null,
      puertosOcupados: puertosOcupados ? Number(puertosOcupados) : null,
      macAddress: macAddress.trim().toUpperCase(),
      ipAddress: ipAddress.trim(),
      observaciones: observaciones.trim(),
      fechaRegistro: isEdit ? (equipos.find((eq) => eq.id === id)?.fechaRegistro) : new Date().toISOString(),
    };

    try {
      await saveEquipo(data);
      await logEvent('INVENTARIO', `${isEdit ? 'Edición' : 'Registro'} de equipo: ${data.marca} ${data.modelo} (S/N: ${data.numeroSerie})`);
      toast.success(isEdit ? 'Equipo actualizado correctamente.' : 'Equipo agregado al inventario.');
      navigate('/inventario');
    } catch (err) {
      toast.error('Error al guardar el equipo.');
    }
  };

  return (
    <div className="app-shell pb-12">
      <PageHeader
        title={isEdit ? 'Editar Equipo' : 'Nuevo Equipo'}
        subtitle={isEdit ? id : 'Completa los datos del activo'}
        onBack={() => navigate('/inventario')}
      />

      <div className="px-6 flex flex-col gap-5">
        <Card className="flex flex-col gap-4" padding="p-5">
          <h2 className="text-sm font-semibold tracking-wider text-[hsl(var(--muted-foreground))] uppercase">
            1. Ubicación del Activo
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Ciudad"
              value={selectedCity}
              onChange={handleCityChange}
              options={cityOptions}
              disabled={isEdit}
              testId="eq-city"
            />

            <Select
              label="Unidad"
              value={selectedUnit}
              onChange={handleUnitChange}
              options={unitOptions}
              disabled={isEdit || !selectedCity}
              error={errors.unit}
              testId="eq-unit"
            />
          </div>

          <Select
            label="Cuarto (MDF / IDF)"
            value={selectedRoom}
            onChange={setSelectedRoom}
            options={roomOptions}
            disabled={isEdit || !selectedUnit}
            error={errors.room}
            testId="eq-room"
          />
        </Card>

        <Card className="flex flex-col gap-4" padding="p-5">
          <h2 className="text-sm font-semibold tracking-wider text-[hsl(var(--muted-foreground))] uppercase">
            2. Especificaciones de Equipo
          </h2>

          <Select
            label="Tipo de Dispositivo"
            value={tipo}
            onChange={handleTypeChange}
            options={typeOptions}
            error={errors.tipo}
            testId="eq-type"
          />

          <div className="grid grid-cols-1 gap-4">
            <Select
              label="Marca"
              value={marca}
              onChange={handleBrandChange}
              options={brandOptions}
              disabled={!tipo}
              error={errors.marca}
              placeholder={tipo ? 'Selecciona marca...' : 'Selecciona tipo de equipo primero'}
              testId="eq-brand"
            />

            {marca === 'OTRO' && (
              <Input
                label="Escribe la Marca Personalizada"
                value={customMarca}
                onChange={setCustomMarca}
                placeholder="Ej. CISCO, DELL, APC..."
                error={errors.customMarca}
                testId="eq-custom-brand"
              />
            )}

            <Select
              label="Modelo"
              value={modelo}
              onChange={setModelo}
              options={modelOptions}
              disabled={!marca || marca === 'OTRO'}
              error={errors.modelo}
              placeholder={marca === 'OTRO' ? 'Ingresa modelo personalizado abajo' : (marca ? 'Selecciona modelo...' : 'Selecciona marca primero')}
              testId="eq-model"
            />

            {((modelo === 'OTRO') || (marca === 'OTRO')) && (
              <Input
                label="Escribe el Modelo Personalizado"
                value={customModelo}
                onChange={setCustomModelo}
                placeholder="Ej. Catalyst 2960-X..."
                error={errors.customModelo}
                testId="eq-custom-model"
              />
            )}

            <Input
              label="Número de Serie"
              value={numeroSerie}
              onChange={setNumeroSerie}
              placeholder="Ingresa el número de serie físico..."
              error={errors.numeroSerie}
              testId="eq-serial"
            />
          </div>
        </Card>

        <Card className="flex flex-col gap-4" padding="p-5">
          <h2 className="text-sm font-semibold tracking-wider text-[hsl(var(--muted-foreground))] uppercase">
            3. Estado Operativo
          </h2>

          <div className="flex flex-col gap-2">
            {[
              { value: 'Operativo', label: 'Operativo', desc: 'El equipo funciona correctamente en producción.' },
              { value: 'Requiere Mantenimiento', label: 'Requiere Mantenimiento', desc: 'Presenta fallos parciales, requiere limpieza, ventilación o refacción.' },
              { value: 'Dañado/Fuera de Servicio', label: 'Dañado/Fuera de Servicio', desc: 'Inoperable o apagado por fallo definitivo.' }
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setEstado(opt.value)}
                className={`w-full text-left p-3.5 rounded-[16px] border-2 transition-all flex flex-col gap-0.5
                  ${estado === opt.value
                    ? 'border-primary bg-primary/5'
                    : 'border-[hsl(var(--muted))] hover:border-[hsl(var(--muted-foreground)/0.3)] bg-transparent'}`}
                data-testid={`eq-status-opt-${opt.value}`}
              >
                <span className="font-bold text-sm">{opt.label}</span>
                <span className="text-xs text-[hsl(var(--muted-foreground))] leading-snug">{opt.desc}</span>
              </button>
            ))}
          </div>
        </Card>

        <Card className="flex flex-col gap-4" padding="p-5">
          <h2 className="text-sm font-semibold tracking-wider text-[hsl(var(--muted-foreground))] uppercase">
            4. Detalles de Conectividad (Llenado Opcional)
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Puertos Totales"
              type="number"
              value={puertosTotales}
              onChange={setPuertosTotales}
              placeholder="Ej. 24, 48"
              testId="eq-ports-total"
            />
            <Input
              label="Puertos Ocupados"
              type="number"
              value={puertosOcupados}
              onChange={setPuertosOcupados}
              placeholder="Ej. 12"
              testId="eq-ports-active"
            />
          </div>

          <Input
            label="Dirección MAC"
            value={macAddress}
            onChange={setMacAddress}
            placeholder="Ej. 00:1A:2B:3C:4D:5E"
            testId="eq-mac"
          />

          <Input
            label="Dirección IP"
            value={ipAddress}
            onChange={setIpAddress}
            placeholder="Ej. 10.16.2.254"
            testId="eq-ip"
          />

          <label className="block">
            <span className="block text-sm text-[hsl(var(--muted-foreground))] mb-2">
              Observaciones del Equipo
            </span>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Registra cualquier observación técnica relevante del activo..."
              rows={3}
              className="w-full p-4 rounded-[16px] bg-[hsl(var(--input))] text-foreground placeholder:text-[hsl(var(--muted-foreground))] outline-none border border-transparent focus:border-primary transition-colors text-base resize-none"
              data-testid="eq-obs"
            />
          </label>
        </Card>

        <div className="flex gap-3 mt-2">
          <Button
            variant="secondary"
            fullWidth
            onClick={() => navigate('/inventario')}
            testId="eq-cancel-btn"
          >
            Cancelar
          </Button>
          <Button
            fullWidth
            icon={Save}
            onClick={handleSave}
            testId="eq-save-btn"
          >
            Guardar Equipo
          </Button>
        </div>
      </div>
    </div>
  );
}
