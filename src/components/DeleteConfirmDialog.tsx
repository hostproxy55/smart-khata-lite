import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}

export const DeleteConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Delete Entry?',
  message = 'This action cannot be undone. Are you sure you want to delete this entry?',
}: DeleteConfirmDialogProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/30 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 400 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card rounded-2xl p-6 w-full max-w-sm shadow-lg border border-border"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-due-light">
                  <AlertTriangle className="w-6 h-6 text-due" />
                </div>
                <h3 className="text-lg font-bold text-foreground">{title}</h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-secondary tap-highlight"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-muted-foreground mb-6">{message}</p>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 h-12"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 h-12 bg-due hover:bg-due/90"
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
              >
                Delete
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
