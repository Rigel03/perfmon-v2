'use client';
import { useState } from 'react';
import { addEmployee } from '@/lib/db/employees';
import { addMFO } from '@/lib/db/mfos';
import { UploadSimple, CheckCircle, WarningOctagon } from '@phosphor-icons/react';

export default function BulkImportAdminPage() {
  const [targetType, setTargetType] = useState<'employees' | 'mfos'>('employees');
  const [csvContent, setCsvContent] = useState<string>('');
  const [importing, setImporting] = useState<boolean>(false);
  const [result, setResult] = useState<{ success: number; errors: number } | null>(null);

  async function handleImport() {
    if (!csvContent.trim()) return;
    setImporting(true);
    setResult(null);

    const lines = csvContent
      .trim()
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    let success = 0;
    let errors = 0;

    for (let i = 0; i < lines.length; i++) {
      const parts = lines[i].split(',').map((p) => p.trim());
      try {
        if (targetType === 'employees') {
          const [name, position, section, employmentType] = parts;
          if (!name) continue;
          await addEmployee({
            name,
            position: position || '',
            section: section || '',
            employmentType: (employmentType as any) === 'jo_cos' ? 'jo_cos' : 'plantilla',
          });
        } else {
          const [category, mfoName, ...descParts] = parts;
          if (!mfoName) continue;
          await addMFO({
            category: category === 'Support' ? 'Support' : 'Core',
            mfoName,
            successIndicatorDesc: descParts.join(','),
          });
        }
        success++;
      } catch (err) {
        console.error('Import line error:', err);
        errors++;
      }
    }

    setImporting(false);
    setResult({ success, errors });
    setCsvContent('');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text)' }}>
          Bulk CSV Import Utility
        </h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
          Batch import division personnel or MFO definitions via comma-separated data
        </p>
      </div>

      <div className="card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          <button
            onClick={() => setTargetType('employees')}
            className={`btn btn-sm ${targetType === 'employees' ? 'btn-primary' : 'btn-outline'}`}
          >
            Import Personnel Roster
          </button>
          <button
            onClick={() => setTargetType('mfos')}
            className={`btn btn-sm ${targetType === 'mfos' ? 'btn-primary' : 'btn-outline'}`}
          >
            Import MFO Definitions
          </button>
        </div>

        <div style={{
          background: 'var(--color-card-secondary)',
          padding: '12px 14px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--color-border)',
          fontSize: '0.78rem',
          color: 'var(--color-text-muted)',
          marginBottom: 14
        }}>
          <strong>Expected format (one per line):</strong>
          {targetType === 'employees' ? (
            <div style={{ fontFamily: 'monospace', marginTop: 4, color: 'var(--color-text)' }}>
              Full Name, Position Title, Section/Unit, plantilla|jo_cos
            </div>
          ) : (
            <div style={{ fontFamily: 'monospace', marginTop: 4, color: 'var(--color-text)' }}>
              Core|Support, MFO Name, Success Indicator Description
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Paste Comma-Separated Values (CSV)</label>
          <textarea
            rows={8}
            className="form-control"
            style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
            placeholder={
              targetType === 'employees'
                ? 'Engr. Juan Dela Cruz, Engineer II, Transport Management, plantilla\nMaria Santos, Traffic Aide I, Administrative Services, jo_cos'
                : 'Core, Traffic Signal Operations, 100% of signals operational 24/7\nSupport, Equipment Maintenance, Bi-weekly routine checkups logged'
            }
            value={csvContent}
            onChange={(e) => setCsvContent(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
          <button
            onClick={handleImport}
            disabled={importing || !csvContent.trim()}
            className="btn btn-primary"
          >
            <UploadSimple size={16} weight="bold" />
            <span>{importing ? 'Processing Import...' : 'Import Data'}</span>
          </button>
        </div>

        {result && (
          <div
            className={`alert ${result.errors > 0 ? 'alert-error' : 'alert-success'}`}
            style={{ marginTop: 14 }}
          >
            {result.errors > 0 ? <WarningOctagon size={18} /> : <CheckCircle size={18} />}
            <span>
              Batch complete: {result.success} records created successfully
              {result.errors > 0 ? `, ${result.errors} lines encountered errors.` : '.'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
