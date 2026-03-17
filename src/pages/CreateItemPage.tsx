import { useNavigate } from "react-router-dom";
import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/button";

export function CreateItemPage() {
    const navigate = useNavigate();

    return (
        <>
            <PageHeader title="Create Item" subtitle="Register a new inventory item with RFID tag">
                <Button variant="outline" onClick={() => navigate("/inventory")}>← Back</Button>
            </PageHeader>

            <div className="max-w-xl">
                {/* panels will go here */}
            </div>
        </>
    );
}