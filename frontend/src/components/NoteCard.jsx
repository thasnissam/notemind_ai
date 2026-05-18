import { motion } from 'framer-motion'
import { FileText, Link, Type, Trash2, Eye } from 'lucide-react'
import { apiDeleteDocument } from '../api'

const TYPE_ICONS = { pdf: FileText, url: Link, note: Type };
const TYPE_COLORS = {
  pdf: { bg: 'rgba(99,102,241,0.15)', color: '#818cf8' },
  url: { bg: 'rgba(14,165,233,0.15)', color: '#38bdf8' },
  note: { bg: 'rgba(16,185,129,0.15)', color: '#34d399' },
};

export default function NoteCard({ note, index = 0, onRefresh }) {
  const Icon = TYPE_ICONS[note.type] || FileText;
  const { bg, color } = TYPE_COLORS[note.type] || TYPE_COLORS.note;

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!confirm("Delete this document and all indexed vectors?")) return;
    try {
      await apiDeleteDocument(note.id);
      onRefresh(); // Reload collections from Dashboard
    } catch (err) { alert(err.message); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
      style={{ background: '#1e1e2e', border: '1px solid #333', padding: 20, borderRadius: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ background: bg, padding: 8, borderRadius: 8 }}>
          <Icon size={16} style={{ color }} />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-ghost" onClick={() => alert(note.content)} title="View Content"><Eye size={15} color="#94a3b8"/></button>
          <button className="btn-ghost" onClick={handleDelete} title="Delete Document"><Trash2 size={15} color="#f87171"/></button>
        </div>
      </div>

      <h4 style={{ color: 'white', fontSize: 14, fontWeight: 500, margin: 0 }}>{note.title}</h4>
      <p style={{ fontSize: 12, color: '#94a3b8', margin: 0, lineHeight: 1.5, height: 55, overflow: 'hidden' }}>{note.preview}</p>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 }}>
        <span style={{ fontSize: 10, background: '#333', color: '#ccc', padding: '3px 8px', borderRadius: 5 }}>{note.tag}</span>
        <span style={{ fontSize: 10, color: '#666' }}>{note.type.toUpperCase()}</span>
      </div>
    </motion.div>
  )
}