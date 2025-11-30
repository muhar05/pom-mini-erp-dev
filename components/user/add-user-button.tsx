'use client';
import { Button } from "../ui/button";

const AddUserButton = () => {
    const handleAddUser = () => {       
        console.log("Add User button clicked");     
    };
    return (
        <Button
            type="button"   
            className="h-[46px] bg-primary hover:bg-blue-700 text-white rounded-lg px-5 py-[11px]"      
            onClick={handleAddUser}                 
        >
            Tambah User
        </Button>
    );
};

export default AddUserButton;