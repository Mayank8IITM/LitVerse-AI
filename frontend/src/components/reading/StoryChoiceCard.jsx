import { motion } from 'framer-motion';

export default function StoryChoiceCard({ choice, onSelect }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(choice)}
      className="card card-interactive"
      style={{
        width: '100%',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.75rem',
        cursor: 'pointer',
        border: '2px solid var(--border)',
        backgroundColor: 'var(--bg-card)',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-body)',
      }}
    >
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: 'var(--accent-soft)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--accent)',
        fontWeight: 'bold',
      }}>
        {choice.id.toUpperCase()}
      </div>
      <span style={{ fontSize: '1.125rem', fontWeight: 600, textAlign: 'center' }}>
        {choice.text}
      </span>
    </motion.button>
  );
}
