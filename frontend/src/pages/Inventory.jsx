import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Plus, Trash2, Edit, Filter, ListFilter } from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '../components/PageHeader';
import SearchBox from '../components/SearchBox';
import Card from '../components/Card';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import BottomNavigation from '../components/BottomNavigation';
import Select from '../components/Select';
import { useEquipmentStore } from '../stores/equipment.store';
import { getCities, getUnitsByCity, getRoomsByUnit, getUnitById, getRoomById } from '../services/catalog.service';

export default function Inventory() {
  const navigate = useNavigate();
  const equipos = useEquipmentStore((s) => s.equipos);
  const loadAll = useEquipmentStore((s) => s.loadAll);
  const deleteEquipo = useEquipmentStore((s) => s.delete);
  const [q, setQ] = useState('');

  // Filter states
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Delete dialog state
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Clean dependent filters on change
  const handleCityChange = (city) => {
    setSelectedCity(city);
    setSelectedUnit('');
    setSelectedRoom('');
  };

  const handleUnitChange = (unit) => {
    setSelectedUnit(unit);
    setSelectedRoom('');
  };

  // Populate options
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

  const unitName = (u) => getUnitById(u)?.nombre || String(u);
  const roomName = (r) => getRoomById(r)?.nombre || String(r);

  // Filter items
  const filtered = useMemo(() => {
    return equipos.filter((eq) => {
      // Type Filter
      if (selectedType && eq.tipo !== selectedType) return false;

      // Unit Filter
      if (selectedUnit && String(eq.unitId) !== selectedUnit) return false;

      // Room Filter
      if (selectedRoom && eq.roomId !== selectedRoom) return false;

      // City Filter (resolved via Unit)
      if (selectedCity && !selectedUnit) {
        const unit = getUnitById(eq.unitId);
        if (!unit || unit.cityId !== selectedCity) return false;
      }

      // Text Search query (Model, Brand, Serial, MAC, IP)
      if (q) {
        const query = q.toLowerCase();
        const text = `${eq.marca} ${eq.modelo} ${eq.numeroSerie} ${eq.macAddress || ''} ${eq.ipAddress || ''} ${unitName(eq.unitId)} ${roomName(eq.roomId)}`.toLowerCase();
        if (!text.includes(query)) return false;
      }

      return true;
    });
  }, [equipos, selectedType, selectedCity, selectedUnit, selectedRoom, q]);

  const handleDeleteConfirm = async () => {
    if (deleteId) {
      try {
        await deleteEquipo(deleteId);
        toast.success('Equipo eliminado del inventario.');
      } catch (err) {
        toast.error('Error al eliminar el equipo.');
      }
      setDeleteId(null);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Operativo':
        return 'bg-[hsl(var(--success)/0.15)] text-[hsl(var(--success))]';
      case 'Requiere Mantenimiento':
        return 'bg-[hsl(var(--warning)/0.15)] text-[hsl(var(--warning))]';
      case 'Dañado/Fuera de Servicio':
        return 'bg-[hsl(var(--error)/0.15)] text-[hsl(var(--error))]';
      default:
        return 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]';
    }
  };

  return (
    <div className="app-shell">
      <PageHeader
        title="Inventario de Equipos"
        subtitle={`${filtered.length} registrados`}
        onBack={() => navigate('/dashboard')}
        right={
          <Button
            size="sm"
            onClick={() => navigate('/inventario/nuevo')}
            icon={Plus}
            testId="inv-add-btn"
          >
            Agregar
          </Button>
        }
      />

      {/* Search and Filter toggle */}
      <div className="px-6 mb-4 flex gap-2">
        <div className="flex-1">
          <SearchBox
            value={q}
            onChange={setQ}
            placeholder="Buscar por serie, modelo, IP, MAC..."
            testId="search-inventory"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`h-14 w-14 flex items-center justify-center rounded-[16px] border transition-all shrink-0
            ${showFilters ? 'bg-primary/10 border-primary text-primary' : 'bg-[hsl(var(--input))] border-transparent text-[hsl(var(--muted-foreground))]'}`}
          aria-label="Toggle Filtros"
          data-testid="toggle-filters-btn"
        >
          {showFilters ? <ListFilter size={22} /> : <Filter size={22} />}
        </button>
      </div>

      {/* Collapsible Filters */}
      {showFilters && (
        <div className="px-6 mb-4 flex flex-col gap-3 p-4 rounded-[20px] bg-[hsl(var(--card))] border border-[hsl(var(--muted))]">
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Ciudad"
              value={selectedCity}
              onChange={handleCityChange}
              options={cityOptions}
              placeholder="Todas"
              testId="filter-city"
            />
            <Select
              label="Tipo de Equipo"
              value={selectedType}
              onChange={setSelectedType}
              options={typeOptions}
              placeholder="Todos"
              testId="filter-type"
            />
          </div>
          
          <Select
            label="Unidad"
            value={selectedUnit}
            onChange={handleUnitChange}
            options={unitOptions}
            placeholder="Todas (Selecciona ciudad)"
            disabled={!selectedCity}
            testId="filter-unit"
          />

          <Select
            label="Cuarto"
            value={selectedRoom}
            onChange={setSelectedRoom}
            options={roomOptions}
            placeholder="Todos (Selecciona unidad)"
            disabled={!selectedUnit}
            testId="filter-room"
          />
          
          {(selectedCity || selectedType || selectedUnit || selectedRoom) && (
            <button
              onClick={() => {
                setSelectedCity('');
                setSelectedUnit('');
                setSelectedRoom('');
                setSelectedType('');
              }}
              className="text-xs text-primary self-end font-semibold py-1 hover:underline"
              data-testid="clear-filters-btn"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      {/* Equipment List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Sin equipos"
          description="Los equipos que registres aparecerán en esta lista."
          testId="inventory-empty"
        />
      ) : (
        <div className="px-6 flex flex-col gap-3 pb-24">
          {filtered.map((eq) => (
            <Card key={eq.id} padding="p-4" testId={`eq-card-${eq.id}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]">
                      {eq.tipo}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${getStatusStyle(eq.estado)}`}>
                      {eq.estado}
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-base mt-2 leading-tight" style={{ fontWeight: 700 }}>
                    {eq.marca} · {eq.modelo}
                  </h3>
                  
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 truncate">
                    S/N: <span className="font-mono">{eq.numeroSerie}</span>
                  </p>
                  
                  {eq.ipAddress && (
                    <p className="text-xs text-[hsl(var(--muted-foreground))] font-mono mt-0.5">
                      IP: {eq.ipAddress}
                    </p>
                  )}

                  {eq.macAddress && (
                    <p className="text-xs text-[hsl(var(--muted-foreground))] font-mono mt-0.5">
                      MAC: {eq.macAddress}
                    </p>
                  )}

                  <div className="border-t border-[hsl(var(--muted))] my-2.5"></div>
                  
                  <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">
                    {unitName(eq.unitId)} · <span className="font-semibold">{roomName(eq.roomId)}</span>
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => navigate(`/inventario/editar/${eq.id}`)}
                    className="h-8 w-8 flex items-center justify-center rounded-full bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:text-foreground"
                    aria-label="Editar Equipo"
                    data-testid={`eq-edit-${eq.id}`}
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteId(eq.id)}
                    className="h-8 w-8 flex items-center justify-center rounded-full bg-[hsl(var(--muted))] text-destructive hover:bg-destructive/10"
                    aria-label="Eliminar Equipo"
                    data-testid={`eq-delete-${eq.id}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        title="¿Eliminar equipo del inventario?"
        description="Se eliminará permanentemente de la base de datos local."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />

      <BottomNavigation />
    </div>
  );
}
