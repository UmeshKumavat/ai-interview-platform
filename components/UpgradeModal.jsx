"use client";

import { PricingTable } from "@clerk/nextjs";

const { AlertCircle } = require("lucide-react");
const {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} = require("./ui/dialog");

const UpgradeModal = ({ open, onOpenChange, reason }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-amber-200/10 min-w-[70vw] max-h-[90vh] overflow-y-scroll">
        <DialogHeader>
          <div className="flex items-start gap-2 mb-2">
            <AlertCircle className="text-amber-400 ml-2 mt-1" />
            <div>
              <DialogTitle className="font-serif text-2xl">
                Upgrade your plan
              </DialogTitle>
              {reason && (
                <DialogDescription className="text-amber-400 mt-1">
                  {reason}
                </DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* PricingSection or any children slot in here */}
        <div className="px-2 pb-6">
          {/* <PricingSection /> */}
          <PricingTable
            checkoutProps={{
              appearance: {
                elements: {
                  drawerRoot: {
                    zIndex: 2000,
                  },
                },
              },
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeModal;
