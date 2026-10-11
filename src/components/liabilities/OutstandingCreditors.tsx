
import { ClipboardList } from "lucide-react";

import "./OutstandingCreditors.css";

const creditors = [
  {
    name: "Stanbic Bank Uganda",
    reference: "Facility Ref #LN-2027",
    type: "Lender / Term Loan",
    amount: 19.8,
  },
  {
    name: "Uganda Revenue Authority",
    reference: "Tax Assessment #URA-08",
    type: "Statutory Tax (PAYE/WHT)",
    amount: 18.5,
  },
  {
    name: "Kampala Textbooks Ltd",
    reference: "PO #KTB-8831",
    type: "Trade Invoices Payable",
    amount: 15.2,
  },
  {
    name: "Britam Insurance",
    reference: "Policy #BR-4410",
    type: "Service / Insurer",
    amount: 12.0,
  },
  {
    name: "City Power & Water",
    reference: "Account #NWSC-904",
    type: "Utility Creditor",
    amount: 10.0,
  },
  {
    name: "NSSF Uganda",
    reference: "Employer Contrib #NSSF-119",
    type: "Statutory Remittance",
    amount: 8.2,
  },
  {
    name: "TotalEnergies Uganda",
    reference: "Account #TE-FUEL-03",
    type: "Fleet & Generator Fuel",
    amount: 5.5,
  },
  {
    name: "Multichoice / Telecom",
    reference: "Account #MC-TEL-88",
    type: "IT & Communication",
    amount: 3.8,
  },
];

export function OutstandingCreditors() {
  return (
    <section
      className="outstanding-creditors"
      aria-labelledby="outstanding-creditors-title"
    >
      <h2
        className="outstanding-creditors__title"
        id="outstanding-creditors-title"
      >
        <ClipboardList size={20} aria-hidden="true" />
        Top 8 Outstanding Creditors
      </h2>

      <div className="outstanding-creditors__table-wrapper">
        <table className="outstanding-creditors__table">
          <thead>
            <tr>
              <th scope="col">Creditor / Entity</th>
              <th scope="col">Type</th>
              <th scope="col" className="outstanding-creditors__amount-heading">
                Outstanding (UGX)
              </th>
            </tr>
          </thead>

          <tbody>
            {creditors.map((creditor) => (
              <tr key={creditor.reference}>
                <td>
                  <div className="creditor-name">
                    <strong>{creditor.name}</strong>
                    <span>{creditor.reference}</span>
                  </div>
                </td>

                <td>
                  <span className="creditor-type">
                    {creditor.type}
                  </span>
                </td>

                <td className="outstanding-creditors__amount">
                  UGX {creditor.amount.toFixed(1)}M
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
