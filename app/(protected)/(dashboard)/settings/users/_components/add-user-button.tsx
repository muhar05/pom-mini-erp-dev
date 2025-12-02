"use client";
import { Button } from "../../../../../../components/ui/button";
import { useRouter } from "next/navigation";

const AddUserButton = () => {
  const router = useRouter();

  const handleAddUser = () => {
    router.push("/settings/users/new");
  };

  return (
    <Button
      type="button"
      className="h-[46px] bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-5 py-[11px] transition-colors"
      onClick={handleAddUser}
    >
      Add User
    </Button>
  );
};

export default AddUserButton;
