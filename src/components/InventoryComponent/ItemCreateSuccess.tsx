

import { SearchCheck } from "lucide-react";
import { Button } from "../ui/button";

interface Props {
    onScanAnother: () => void;
    onGoToInventory: () => void;
}

export function ItemCreateSuccess({ onScanAnother, onGoToInventory }: Props) {
    return (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center">
            <div className="flex items-center justify-center mb-2">
                <SearchCheck className="text-green-400 w-8 h-8" />
            </div>
            <div className="font-semibold text-green-400 mb-1">Item Created Successfully</div>
            <div className="text-sm text-muted-foreground mb-4">What would you like to do next?</div>
            <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={onScanAnother}>
                    <SearchCheck/> Scan Another Tag
                </Button>
                <Button onClick={onGoToInventory}>
                    Go to Inventory
                </Button>
            </div>
        </div>
    );
}