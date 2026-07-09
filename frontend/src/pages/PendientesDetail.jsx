import { useEffect, useState, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertTriangle, Calendar, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { usePendienteStore } from '../stores/pendiente.store';
import { getUnitById, getRoomById } from '../services/catalog.service';
import { AnimatePresence, motion } from 'framer-motion';

export default function PendientesDetail() {
  const { unitId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { pendientes, loading, loadByUnit, resolve } = usePendienteStore();

  const activeTab = searchParams.get('tab') || 'pendientes'; // 'pendientes' | 'resueltos'
  const unit = getUnitById(Number(unitId));

  // Modal State
  const [selectedItem, setSelectedItem] = useState(null);
  const [resolutionComment, setResolutionComment] = useState('');
  const [commentError, setCommentError] = useState('');

  useEffect(() => {
    loadByUnit(Number(unitId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitId]);

  // Group findings by room
  const groupedRooms = useMemo(() => {
    const map = {};

    pendientes.forEach((p) => {
      const match = activeTab === 'pendientes' ? !p.resolved : p.resolved;
      if (!match) return;

      if (!map[p.roomId]) {
        const rInfo = getRoomById(p.roomId);
        map[p.roomId] = {
          id: p.roomId,
          nombre: rInfo ? rInfo.nombre : `Cuarto ${p.roomId}`,
          items: [],
        };
      }
      map[p.roomId].items.push(p);
    });

    return Object.values(map).sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [pendientes, activeTab]);

  const handleOpenResolve = (item) => {
    setSelectedItem(item);
    setResolutionComment('');
    setCommentError('');
  };

  const handleCloseResolve = () => {
    setSelectedItem(null);
  };

  const handleSubmitResolve = async () => {
    if (!resolutionComment.trim()) {
      setCommentError('Por favor describe cómo se solucionó este hallazgo.');
      return;
    }

    try {
      await resolve(selectedItem.id, resolutionComment.trim());
      toast.success('Hallazgo marcado como resuelto correctamente.');
      handleCloseResolve();
      loadByUnit(Number(unitId));
    } catch (err) {
      toast.error('Error al resolver el hallazgo.');
    }
  };

  const formatDateString = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('es-MX', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return isoString;
    }
  };

  return (
    <div className="app-shell pb-12">
      <div className="px-6 pt-6">
        <button
          onClick={() => navigate('/pendientes')}
          className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))] hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} />
          Volver a Pendientes
        </button>
      </div>

      <PageHeader
        title={unit ? unit.nombre : `Detalle de Pendientes`}
        subtitle={activeTab === 'pendientes' ? 'Hallazgos activos por cuarto' : 'Historial de hallazgos resueltos'}
      />

      {/* Main List */}
      <div className="px-6 flex flex-col gap-6">
        {loading ? (
          <Card>
            <p className="text-center py-6 text-[hsl(var(--muted-foreground))] text-sm">
              Cargando...
            </p>
          </Card>
        ) : groupedRooms.length === 0 ? (
          <Card>
            <div className="text-center py-8 flex flex-col items-center justify-center gap-2">
              <CheckCircle size={32} className="text-success" />
              <p className="font-semibold text-sm">Sin elementos</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))] max-w-[280px]">
                No hay hallazgos registrados para esta unidad en esta sección.
              </p>
            </div>
          </Card>
        ) : (
          groupedRooms.map((room) => (
            <div key={room.id} className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider px-1">
                {room.nombre}
              </h3>
              
              <div className="flex flex-col gap-3">
                {room.items.map((item) => (
                  <Card key={item.id} padding="p-4" testId={`finding-${item.id}`}>
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-semibold text-base text-foreground leading-snug">
                          {item.questionTitle}
                        </h4>
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap shrink-0
                            ${activeTab === 'pendientes'
                              ? 'bg-[hsl(var(--destructive)/0.15)] text-[hsl(var(--destructive))]'
                              : 'bg-[hsl(var(--success)/0.15)] text-[hsl(var(--success))]'}`}
                        >
                          {activeTab === 'pendientes' ? 'Pendiente' : 'Solucionado'}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1 text-sm text-[hsl(var(--muted-foreground))]">
                        <p className="flex items-center gap-1.5">
                          <AlertTriangle size={14} className="text-[hsl(var(--warning))]" />
                          <span>Valor registrado: <strong>{item.originalAnswer}</strong></span>
                        </p>
                        <p className="flex items-center gap-1.5 mt-0.5">
                          <Calendar size={14} />
                          <span>Detectado el: {item.fechaDeteccion}</span>
                        </p>
                      </div>

                      {/* Display Resolution Comment if Resolved */}
                      {item.resolved && (
                        <div className="mt-2 p-3 rounded-[12px] bg-[hsl(var(--muted))] border border-[hsl(var(--border))] flex flex-col gap-1.5">
                          <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] flex items-center gap-1">
                            <MessageSquare size={12} />
                            Solución Aplicada ({formatDateString(item.resolvedAt)}):
                          </p>
                          <p className="text-sm text-foreground italic">
                            "{item.resolutionComment}"
                          </p>
                        </div>
                      )}

                      {/* Action Button for Unresolved Pending Items */}
                      {!item.resolved && (
                        <div className="mt-1 flex justify-end">
                          <Button
                            className="h-9 text-xs px-4"
                            onClick={() => handleOpenResolve(item)}
                            testId={`resolve-btn-${item.id}`}
                          >
                            Resolver Hallazgo
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Resolve Modal Dialog */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleCloseResolve}
          >
            <motion.div
              className="w-full max-w-[560px] bg-[hsl(var(--card))] rounded-[20px] p-6 flex flex-col"
              initial={{ y: 40 }}
              animate={{ y: 0 }}
              exit={{ y: 40 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              data-testid="resolve-finding-dialog"
            >
              <h3 className="text-lg font-semibold mb-2" style={{ fontWeight: 600 }}>Resolver Hallazgo</h3>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">
                Por favor, describe brevemente qué acción o solución correctiva se implementó para resolver el pendiente: <strong className="text-foreground">{selectedItem.questionTitle}</strong>.
              </p>

              <div className="mb-6">
                <label className="block text-sm text-[hsl(var(--muted-foreground))] mb-2">
                  Detalle de la Solución
                </label>
                <textarea
                  value={resolutionComment}
                  onChange={(e) => {
                    setResolutionComment(e.target.value);
                    if (e.target.value.trim()) setCommentError('');
                  }}
                  placeholder="Ej: Se instaló un extintor de CO2 nuevo marca FireStop con carga y vigencia de 1 año..."
                  rows={3}
                  className={`w-full p-4 rounded-[16px] bg-[hsl(var(--input))] text-foreground placeholder:text-[hsl(var(--muted-foreground))] outline-none border transition-colors text-base resize-none
                    ${commentError ? 'border-destructive' : 'border-transparent focus:border-primary'}`}
                  data-testid="resolve-comment-input"
                />
                {commentError && (
                  <p className="text-xs text-destructive mt-1.5">{commentError}</p>
                )}
              </div>

              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={handleCloseResolve} testId="resolve-cancel-btn">
                  Cancelar
                </Button>
                <Button className="flex-1" onClick={handleSubmitResolve} testId="resolve-save-btn">
                  Guardar Solución
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
