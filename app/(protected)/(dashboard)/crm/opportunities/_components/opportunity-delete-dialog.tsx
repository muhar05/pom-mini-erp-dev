type OpportunityDeleteDialogProps = {
  opportunity: any;
  onClose?: () => void;
  // onSuccess?: () => void;
};

export default function OpportunityDeleteDialog({
  opportunity,
}: OpportunityDeleteDialogProps) {
  return (
    <button>
      Delete
      {/* Dialog konfirmasi hapus */}
    </button>
  );
}
