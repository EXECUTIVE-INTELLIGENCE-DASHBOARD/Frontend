import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import {
  categoryLabels,
  formatUgx,
} from "./procurementFinancials.data";
import type { Vendor as VendorSpend } from "./procurementFinancials.types";

interface AllVendorsDialogProps {
  open: boolean;
  onClose: () => void;
  vendors: VendorSpend[];
  totalSpend: number;
}

const FOCUSABLE = 'button, [href], [tabindex]:not([tabindex="-1"])';

export function AllVendorsDialog({
  open,
  onClose,
  vendors,
  totalSpend,
}: AllVendorsDialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    // Remember what had focus, so it can go back there on close.
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      // Keep Tab inside the dialog while it is open.
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);

      if (!focusable || focusable.length === 0) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [open]);

  if (!open) {
    return null;
  }

  return createPortal(
    <div
      className="pf-dialog"
      data-testid="vendors-backdrop"
      onClick={(event) => {
        // Only a click on the dark backdrop itself closes the dialog.
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={panelRef}
        className="pf-dialog__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pf-vendors-title"
      >
        <div className="pf-dialog__header">
          <div>
            <h2 id="pf-vendors-title" className="pf-dialog__title">
              All {vendors.length} Vendors
            </h2>
            <p className="pf-dialog__subtitle">Ranked by total spend</p>
          </div>

          <button
            ref={closeRef}
            type="button"
            className="pf-dialog__close"
            aria-label="Close vendor list"
            onClick={onClose}
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        <div
          className="pf-dialog__scroll"
          role="region"
          aria-label="Vendor list"
          tabIndex={0}
        >
          <table className="pf-dialog__table">
            <thead>
              <tr>
                <th scope="col">Rank</th>
                <th scope="col">Vendor</th>
                <th scope="col">Category</th>
                <th scope="col" className="pf-dialog__num">
                  Total spend
                </th>
                <th scope="col" className="pf-dialog__num">
                  Share
                </th>
              </tr>
            </thead>

            <tbody>
              {vendors.map((vendor) => (
                <tr key={vendor.id}>
                  <td className="pf-dialog__rank">#{vendor.rank}</td>
                  <td className="pf-dialog__name">{vendor.name}</td>
                  <td>
                    <span className={`pf-badge pf-tone--${vendor.category}`}>
                      {categoryLabels[vendor.category]}
                    </span>
                  </td>
                  <td className="pf-dialog__num pf-dialog__amount">
                    {formatUgx(vendor.spend)}
                  </td>
                  <td className="pf-dialog__num">
                    {(
                      (totalSpend > 0 ? vendor.spend / totalSpend : 0) *
                      100
                    ).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pf-dialog__footer">
          {vendors.length} vendors · {formatUgx(totalSpend)} total
          spend
        </div>
      </div>
    </div>,
    document.body,
  );
}
