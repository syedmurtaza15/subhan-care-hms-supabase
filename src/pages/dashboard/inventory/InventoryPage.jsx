import { useMemo, useState } from 'react';
import {
  Package,
  Plus,
  Pencil,
  Trash2,
  Eye,
  AlertTriangle,
  Boxes,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  Search,
} from 'lucide-react';
import {
  Button,
  Card,
  ConfirmDialog,
  DateInput,
  EmptyState,
  Input,
  Modal,
  Pagination,
  SearchInput,
  Select,
  StatusBadge,
} from '../../../components/ui';
import { useInventory } from '../../../context/DataContext';
import { useToast } from '../../../context/ToastContext';
import { formatDate } from '../../../utils/helpers';
import InventoryForm from './InventoryForm';
import './InventoryPage.css';

const CATEGORY_FILTERS = [
  { value: 'all', label: 'All categories' },
  { value: 'Medication', label: 'Medication' },
  { value: 'Supplies', label: 'Supplies' },
  { value: 'Equipment', label: 'Equipment' },
];

const STATUS_FILTERS = [
  { value: 'all', label: 'All statuses' },
  { value: 'in-stock', label: 'In stock' },
  { value: 'low-stock', label: 'Low stock' },
  { value: 'out-of-stock', label: 'Out of stock' },
];

const InventoryPage = () => {
  const inventory = useInventory();
  const toast = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ category: 'all', status: 'all' });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  const [editing, setEditing] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [adjusting, setAdjusting] = useState(null);
  const [adjustDelta, setAdjustDelta] = useState(0);

 const stats = useMemo(() => {
  const list = inventory.list();
  const totalItems = list.length;
  const inStock = list.filter((i) => i.status === 'in-stock').length;
  const lowStock = list.filter((i) => i.status === 'low-stock').length;
  const outOfStock = list.filter((i) => i.status === 'out-of-stock').length;

  const inventoryValue = list.reduce(
    (acc, i) => acc + (Number(i.stock) || 0) * (Number(i.unitPrice) || 0),
    0
  );

  return { totalItems, inStock, lowStock, outOfStock, inventoryValue };
}, [inventory]);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return inventory.list().filter((i) => {
      if (term) {
        const haystack = `${i.itemName || ''} ${i.category || ''} ${i.supplier || ''}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      if (filters.category !== 'all' && i.category !== filters.category) return false;
      if (filters.status !== 'all' && i.status !== filters.status) return false;
      return true;
    });
  }, [inventory, searchTerm, filters]);

  const sorted = useMemo(
    () => filtered.slice().sort((a, b) => (a.itemName || '').localeCompare(b.itemName || '')),
    [filtered],
  );
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, currentPage, pageSize]);

  const handleCreate = async (values) => {
    const created = await inventory.create(values);
    toast.success('Item added', `${created.itemName} is now in inventory.`);
    setCreateOpen(false);
  };

  const handleEdit = async (values) => {
    const updated = await inventory.update(editing.id, values);
    toast.success('Item updated', `${updated.itemName} saved.`);
    setEditing(null);
  };

  const handleDelete = async () => {
    if (!deleting) return;
    await inventory.remove(deleting.id);
    toast.success('Item removed', `${deleting.itemName} was deleted from inventory.`);
    setDeleting(null);
  };

  const handleAdjust = async () => {
    if (!adjusting) return;
    const newStock = Math.max(0, adjusting.stock + Number(adjustDelta || 0));
    const status = deriveStatus(newStock, adjusting.reorderLevel);
    await inventory.update(adjusting.id, { stock: newStock, status });
    toast.success('Stock adjusted', `${adjusting.itemName} now at ${newStock} ${adjusting.unit || 'units'}.`);
    setAdjusting(null);
    setAdjustDelta(0);
  };

  return (
    <div className="inventory-page">
      <header className="inventory-page__header">
        <div>
          <span className="inventory-page__eyebrow">Inventory Module</span>
          <h1>Inventory &amp; Pharmacy</h1>
          <p>
            Track every medication and supply in stock — with low-stock alerts, expiry
            tracking, and quick stock adjustments.
          </p>
        </div>
        <Button variant="primary" leftIcon={Plus} onClick={() => setCreateOpen(true)}>
          Add Item
        </Button>
      </header>

      <section className="inventory-page__stats">
        <div className="inventory-page__stat">
          <Boxes size={18} aria-hidden="true" />
          <div>
            <p className="inventory-page__stat-label">Total items</p>
            <p className="inventory-page__stat-value">{stats.totalItems}</p>
          </div>
        </div>
        <div className="inventory-page__stat">
          <CheckCircle2 size={18} aria-hidden="true" />
          <div>
            <p className="inventory-page__stat-label">In stock</p>
            <p className="inventory-page__stat-value">{stats.inStock}</p>
          </div>
        </div>
        <div className="inventory-page__stat inventory-page__stat--warning">
          <AlertTriangle size={18} aria-hidden="true" />
          <div>
            <p className="inventory-page__stat-label">Low stock</p>
            <p className="inventory-page__stat-value">{stats.lowStock}</p>
          </div>
        </div>
        <div className="inventory-page__stat inventory-page__stat--danger">
          <Package size={18} aria-hidden="true" />
          <div>
            <p className="inventory-page__stat-label">Out of stock</p>
            <p className="inventory-page__stat-value">{stats.outOfStock}</p>
          </div>
        </div>
        <div className="inventory-page__stat">
          <DollarSign size={18} aria-hidden="true" />
          <div>
  <p className="inventory-page__stat-label">Inventory value</p>
  <p className="inventory-page__stat-value">
    Rs {(stats.inventoryValue ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
  </p>
</div>
        </div>
      </section>

      {stats.outOfStock + stats.lowStock > 0 && (
        <Card className="inventory-page__alert" padding={false}>
          <div className="inventory-page__alert-content">
            <span className="inventory-page__alert-icon">
              <AlertTriangle size={20} />
            </span>
            <div>
              <p className="inventory-page__alert-title">Stock alerts</p>
              <p className="inventory-page__alert-body">
                <strong>{stats.lowStock}</strong> items are running low, <strong>{stats.outOfStock}</strong> are out of stock.
                Reorder soon to keep patient care uninterrupted.
              </p>
            </div>
          </div>
        </Card>
      )}

      <Card padding={false}>
        <div className="inventory-page__toolbar">
          <SearchInput
            value={searchTerm}
            placeholder="Search by name, SKU, supplier…"
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setCurrentPage(1);
            }}
          />
          <div className="inventory-page__filters">
            <Select
              name="category"
              value={filters.category}
              options={CATEGORY_FILTERS}
              onChange={(event) => {
                setFilters((f) => ({ ...f, category: event.target.value }));
                setCurrentPage(1);
              }}
            />
            <Select
              name="status"
              value={filters.status}
              options={STATUS_FILTERS}
              onChange={(event) => {
                setFilters((f) => ({ ...f, status: event.target.value }));
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        <div className="inventory-page__tableWrap">
          <table className="inventory-page__table">
            <thead>
              <tr>
                <th>Item</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Reorder at</th>
                <th>Unit price</th>
                <th>Supplier</th>
                <th>Expiry</th>
                <th>Status</th>
                <th aria-label="actions" />
              </tr>
            </thead>
            <tbody>
              {pageItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="inventory-page__name">
                      <span className="inventory-page__icon-cell">
                        <Package size={14} />
                      </span>
                      <strong>{item.itemName || 'Unnamed item'}</strong>
                    </div>
                  </td>
                  <td>
                    <span className="inventory-page__sku">—</span>
                  </td>
                  <td>
                    <span className={`inventory-page__cat inventory-page__cat--${(item.category || 'other').toLowerCase()}`}>
                      {item.category || 'Other'}
                    </span>
                  </td>
                  <td>
                    <div className="inventory-page__stock">
                      <strong>{item.stock}</strong>
                      <span>{item.unit}</span>
                    </div>
                  </td>
                  <td>{item.reorderLevel}</td>
<td>Rs {(item.unitPrice ?? 0).toLocaleString()}</td>
<td>{item.supplier}</td>
<td>{formatDate(item.expiryDate)}</td>
<td>
  <StatusBadge 
    tone={
      item.status === 'in-stock'
        ? 'active'
        : item.status === 'low-stock'
        ? 'pending'
        : 'overdue'
    }
  >
    {item.status === 'in-stock'
      ? 'in stock'
      : (item.status ?? '').replace('-', ' ')}
  </StatusBadge>
</td>
                  <td>
                    <div className="inventory-page__row-actions">
                      <button
                        type="button"
                        className="inventory-page__icon-btn"
                        onClick={() => {
                          setAdjusting(item);
                          setAdjustDelta(0);
                        }}
                        title="Adjust stock"
                      >
                        <TrendingUp size={16} />
                      </button>
                      <button
                        type="button"
                        className="inventory-page__icon-btn"
                        onClick={() => {
                          setEditing(item);
                          setCreateOpen(false);
                        }}
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        className="inventory-page__icon-btn inventory-page__icon-btn--danger"
                        onClick={() => setDeleting(item)}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {pageItems.length === 0 && (
            <EmptyState
              icon={Package}
              title="No inventory items found"
              description="Try clearing filters or add a new item."
              action={
                <Button variant="primary" leftIcon={Plus} onClick={() => setCreateOpen(true)}>
                  Add Item
                </Button>
              }
            />
          )}
        </div>

        {sorted.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={sorted.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
          />
        )}
      </Card>

      <Modal
        isOpen={createOpen || Boolean(editing)}
        onClose={() => {
          setCreateOpen(false);
          setEditing(null);
        }}
        title={editing ? 'Edit inventory item' : 'Add inventory item'}
        subtitle={editing ? `Update ${editing.itemName}.` : 'Add a new medication or supply to inventory.'}
        size="lg"
      >
        <InventoryForm
          initialValues={editing}
          onSubmit={editing ? handleEdit : handleCreate}
          onCancel={() => {
            setCreateOpen(false);
            setEditing(null);
          }}
        />
      </Modal>

      <Modal
        isOpen={Boolean(adjusting)}
        onClose={() => {
          setAdjusting(null);
          setAdjustDelta(0);
        }}
        title="Adjust stock"
        subtitle={adjusting ? `Update quantity for ${adjusting.itemName}.` : ''}
        size="sm"
      >
        {adjusting && (
          <div className="inventory-page__adjust">
            <p className="inventory-page__adjust-info">
              Current stock: <strong>{adjusting.stock} {adjusting.unit}</strong>
            </p>
            <Input
              label={`Quantity to ${adjustDelta >= 0 ? 'add' : 'remove'}`}
              type="number"
              value={adjustDelta}
              onChange={(event) => setAdjustDelta(Number(event.target.value))}
              placeholder="e.g. 50 to add, -10 to remove"
              helperText="Positive values add to stock, negative values remove."
            />
            <p className="inventory-page__adjust-preview">
              New stock:{' '}
              <strong>
                {Math.max(0, adjusting.stock + Number(adjustDelta || 0))} {adjusting.unit}
              </strong>
            </p>
            <div className="inventory-page__adjust-actions">
              <Button variant="outline" onClick={() => {
                setAdjusting(null);
                setAdjustDelta(0);
              }}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleAdjust} disabled={!adjustDelta}>
                Save adjustment
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        variant="danger"
        title="Delete item?"
        confirmLabel="Delete item"
        body={
          <>
            You&apos;re about to remove <strong>{deleting?.itemName}</strong> from
            inventory. This action cannot be undone.
          </>
        }
      />
    </div>
  );
};

const deriveStatus = (stock, reorderLevel) => {
  if (stock <= 0) return 'out-of-stock';
  if (stock <= reorderLevel) return 'low-stock';
  return 'in-stock';
};

export default InventoryPage;
