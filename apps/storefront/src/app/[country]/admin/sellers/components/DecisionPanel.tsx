import { CheckCircle, XCircle, AlertCircle, ShieldAlert } from 'lucide-react';
import { approveSellerAction, rejectSellerAction, requestSellerInfoAction } from '../actions';

export function DecisionPanel({
  profileId,
  currentStatus,
  dict
}: {
  profileId: string;
  currentStatus: string;
  dict: any;
}) {
  const isPending = currentStatus === 'UNDER_REVIEW' || currentStatus === 'PENDING_DOCUMENTS';

  if (!isPending) return null;

  return (
    <div className="bg-neutral-50 p-6 rounded-2xl border border-neutral-200 mt-6">
      <div className="flex items-center gap-2 mb-4">
        <ShieldAlert className="w-5 h-5 text-yellow-600" />
        <h3 className="font-bold text-secondary">{dict?.adminSellerReview?.decisionPanel?.title }</h3>
      </div>
      
      <div className="bg-yellow-50 text-yellow-800 text-sm p-4 rounded-xl border border-yellow-200 mb-6 font-medium">
        {dict?.adminSellerReview?.decisionPanel?.actionWarning }
      </div>

      <div className="flex flex-col gap-4">
        <form action={approveSellerAction}>
          <input type="hidden" name="sellerId" value={profileId} />
          <button type="submit" className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-green-700 transition">
            <CheckCircle className="w-5 h-5"/> {dict?.adminSellers?.btnApprove }
          </button>
        </form>

        <form action={rejectSellerAction} className="flex flex-col gap-2">
          <input type="hidden" name="sellerId" value={profileId} />
          <input type="text" name="reason" required placeholder={dict?.adminSellers?.rejectReason } className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:outline-none focus:border-red-500" />
          <button type="submit" className="w-full bg-red-100 text-red-700 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-red-200 transition">
            <XCircle className="w-5 h-5"/> {dict?.adminSellers?.btnReject }
          </button>
        </form>

        <form action={requestSellerInfoAction} className="flex flex-col gap-2">
          <input type="hidden" name="sellerId" value={profileId} />
          <input type="text" name="reason" required placeholder={dict?.adminSellers?.infoReason } className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:outline-none focus:border-orange-500" />
          <button type="submit" className="w-full bg-orange-100 text-orange-700 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-orange-200 transition">
            <AlertCircle className="w-5 h-5"/> {dict?.adminSellers?.btnRequestInfo }
          </button>
        </form>
      </div>
    </div>
  );
}
