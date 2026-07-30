import { useState } from 'react';
import {
  Button,
  DateInput,
  Input,
  Select,
} from '../../../components/ui';
import {
  validateRequired,
  isEmpty,
} from '../../../utils/validators';
import './InventoryForm.css';

const CATEGORY_OPTIONS = [
  { value: 'Medication', label: 'Medication' },
  { value: 'Supplies', label: 'Supplies' },
  { value: 'Equipment', label: 'Equipment' },
];

const UNIT_OPTIONS = [
  { value: 'tablets', label: 'tablets' },
  { value: 'capsules', label: 'capsules' },
  { value: 'boxes', label: 'boxes' },
  { value: 'pieces', label: 'pieces' },
  { value: 'bottles', label: 'bottles' },
  { value: 'vials', label: 'vials' },
  { value: 'units', label: 'units' },
];

const SUPPLIER_OPTIONS = [
  { value: 'PharmaCorp', label: 'PharmaCorp' },
  { value: 'MediSource', label: 'MediSource' },
  { value: 'CardioMed', label: 'CardioMed' },
  { value: 'NeuroMed', label: 'NeuroMed' },
  { value: 'SafeHealth', label: 'SafeHealth' },
];

const generateId = () =>
  `INV-${Date.now().toString(36).toUpperCase().slice(-4)}${Math.floor(Math.random() * 100)
    .toString()
    .padStart(2, '0')}`;

const deriveStatus = (stock, reorderLevel) => {
  if (stock <= 0) return 'out-of-stock';
  if (stock <= reorderLevel) return 'low-stock';
  return 'in-stock';
};

const InventoryForm = ({ initialValues, onSubmit, onCancel }) => {
  const [values, setValues] = useState(() => {
    const today = new Date();
    const inOneYear = new Date(today);
    inOneYear.setFullYear(today.getFullYear() + 1);
    return {
      id: initialValues?.id || generateId(),
      name: initialValues?.name || '',
      sku: initialValues?.sku || '',
      category: initialValues?.category || 'Medication',
      stock: initialValues?.stock || 0,
      reorderLevel: initialValues?.reorderLevel || 10,
      unit: initialValues?.unit || 'tablets',
      unitPrice: initialValues?.unitPrice || 0,
      supplier: initialValues?.supplier || 'PharmaCorp',
      expiryDate: initialValues?.expiryDate
        ? new Date(initialValues.expiryDate).toISOString().split('T')[0]
        : inOneYear.toISOString().split('T')[0],
    };
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateAll = (vals) => ({
    name: validateRequired(vals.name, 'Item name'),
    sku: validateRequired(vals.sku, 'SKU'),
    stock: isEmpty(vals.stock) ? 'Stock is required' : Number(vals.stock) < 0 ? 'Stock cannot be negative' : '',
    reorderLevel: isEmpty(vals.reorderLevel) ? 'Reorder level is required' : Number(vals.reorderLevel) < 0 ? 'Must be non-negative' : '',
    unitPrice: isEmpty(vals.unitPrice) ? 'Unit price is required' : Number(vals.unitPrice) < 0 ? 'Price cannot be negative' : '',
  });

  const handleChange = (event) => {
    const { name, value, type } = event.target;
    const nextValue = type === 'number' ? (value === '' ? '' : Number(value)) : value;
    const next = { ...values, [name]: nextValue };
    setValues(next);
    if (touched[name]) setErrors(validateAll(next));
  };

  const handleBlur = (event) => {
    const { name } = event.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors(validateAll(values));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const allErrors = validateAll(values);
    setErrors(allErrors);
    setTouched(Object.fromEntries(Object.keys(values).map((k) => [k, true])));
    if (Object.values(allErrors).some(Boolean)) return;
    setIsSubmitting(true);
    try {
      const payload = {
        ...values,
        stock: Number(values.stock),
        reorderLevel: Number(values.reorderLevel),
        unitPrice: Number(values.unitPrice),
        expiryDate: new Date(values.expiryDate).toISOString(),
        status: deriveStatus(Number(values.stock), Number(values.reorderLevel)),
      };
      await onSubmit(payload);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="inventory-form" onSubmit={handleSubmit} noValidate>
      <div className="inventory-form__grid">
        <Input
          label="Item name"
          name="name"
          value={values.name}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="e.g. Amlodipine 5mg"
          required
          error={touched.name ? errors.name : ''}
        />
        <Input
          label="SKU"
          name="sku"
          value={values.sku}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="e.g. MED-AML-05"
          required
          error={touched.sku ? errors.sku : ''}
        />
        <Select
          label="Category"
          name="category"
          value={values.category}
          options={CATEGORY_OPTIONS}
          onChange={handleChange}
        />
        <Select
          label="Unit"
          name="unit"
          value={values.unit}
          options={UNIT_OPTIONS}
          onChange={handleChange}
        />
        <Input
          label="Stock quantity"
          name="stock"
          type="number"
          value={values.stock}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          error={touched.stock ? errors.stock : ''}
        />
        <Input
          label="Reorder level"
          name="reorderLevel"
          type="number"
          value={values.reorderLevel}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          error={touched.reorderLevel ? errors.reorderLevel : ''}
          helperText="Alert when stock falls to or below this number."
        />
        <Input
          label="Unit price (Rs)"
          name="unitPrice"
          type="number"
          value={values.unitPrice}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          error={touched.unitPrice ? errors.unitPrice : ''}
        />
        <Select
          label="Supplier"
          name="supplier"
          value={values.supplier}
          options={SUPPLIER_OPTIONS}
          onChange={handleChange}
        />
        <DateInput
          label="Expiry date"
          name="expiryDate"
          value={values.expiryDate}
          onChange={handleChange}
        />
      </div>
      <div className="inventory-form__actions">
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" isLoading={isSubmitting}>
          {initialValues ? 'Save item' : 'Add item'}
        </Button>
      </div>
    </form>
  );
};

export default InventoryForm;