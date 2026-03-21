import React, { useState, useEffect } from 'react';

interface EditGoalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  initialData: {
    next_career_goal: string;
    target_title: string;
    target_date: string;
    salary_min: number;
    salary_max: number;
    currency: string;
  };
}

const EditGoalsModal: React.FC<EditGoalsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [formData, setFormData] = useState(initialData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Failed to save goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === 'salary_min' || name === 'salary_max') {
      const numValue = value === '' ? 0 : parseInt(value, 10);
      setFormData((prev) => ({
        ...prev,
        [name]: numValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>Edit Goals</h2>
          <button onClick={onClose} style={styles.closeBtn}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Next Career Goal</label>
            <select
              name="next_career_goal"
              value={formData.next_career_goal}
              onChange={handleChange}
              style={styles.select}
            >
              <option value="A fresh start">A fresh start</option>
              <option value="Promotion">Promotion</option>
              <option value="Career change">Career change</option>
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Target Title</label>
            <input
              type="text"
              name="target_title"
              value={formData.target_title}
              onChange={handleChange}
              placeholder="e.g. Data Science"
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Target Date</label>
            <div style={styles.dateInputWrapper}>
              <input
                type="date"
                name="target_date"
                value={formData.target_date}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Salary Min</label>
            <input
              type="number"
              name="salary_min"
              value={formData.salary_min || ''}
              onChange={handleChange}
              min="0"
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Salary Max</label>
            <input
              type="number"
              name="salary_max"
              value={formData.salary_max || ''}
              onChange={handleChange}
              min="0"
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Currency</label>
            <select
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              style={styles.select}
            >
              <option value="US Dollar">US Dollar</option>
              <option value="VN Dong">VN Dong</option>
              <option value="Euro">Euro</option>
            </select>
          </div>

          <div style={styles.footer}>
            <button type="button" onClick={onClose} style={styles.cancelBtn}>
              Cancel
            </button>
            <button type="submit" disabled={loading} style={styles.saveBtn}>
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    width: '100%',
    maxWidth: '500px',
    padding: '32px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    margin: 0,
    color: '#000',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#888',
    padding: 0,
    display: 'flex',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#000',
  },
  input: {
    padding: '12px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '16px',
    width: '100%',
    boxSizing: 'border-box',
  },
  select: {
    padding: '12px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '16px',
    width: '100%',
    appearance: 'none',
    backgroundColor: '#fff',
    backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23888%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    backgroundSize: '16px',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '12px',
  },
  cancelBtn: {
    padding: '10px 20px',
    borderRadius: '20px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#114a43',
    fontWeight: '500',
    cursor: 'pointer',
  },
  saveBtn: {
    padding: '10px 32px',
    borderRadius: '20px',
    border: 'none',
    backgroundColor: '#ffb800',
    color: '#000',
    fontWeight: '600',
    cursor: 'pointer',
  },
  dateInputWrapper: {
    position: 'relative',
  },
};

export default EditGoalsModal;
