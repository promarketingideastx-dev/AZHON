import { MapPin, AlertTriangle } from 'lucide-react';
import { DataSourceBadge } from './DataSourceBadge';

export function AddressOperativeCard({
  addressData,
  dict
}: {
  addressData: any;
  dict: any;
}) {
  if (!addressData || Object.keys(addressData).length === 0) {
    return (
      <div className="text-sm text-neutral-500 italic">
        {dict?.adminSellerReview?.emptyStates?.noAddress }
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-secondary flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" /> 
          {dict?.adminSellerReview?.tabs?.address }
        </h3>
        <DataSourceBadge source="progressData" label={dict?.adminSellerReview?.sources?.sourceInput } />
      </div>

      <div className="bg-yellow-50 text-yellow-800 text-sm p-4 rounded-xl border border-yellow-200 font-medium flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <p>{dict?.adminSellerReview?.warnings?.addressGpsUnverified }</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-white p-6 rounded-2xl border border-neutral-200">
        <div className="col-span-full">
          <p className="text-xs font-bold text-neutral-400 uppercase">{dict?.adminSellerReview?.address?.addressLine }</p>
          <p className="font-medium text-secondary">{addressData.addressLine1 }</p>
        </div>
        <div className="col-span-full">
          <p className="text-xs font-bold text-neutral-400 uppercase">{dict?.adminSellerReview?.address?.reference }</p>
          <p className="font-medium text-secondary">{addressData.reference }</p>
        </div>
        
        <div>
          <p className="text-xs font-bold text-neutral-400 uppercase">{dict?.adminSellerReview?.address?.cityNameRaw }</p>
          <p className="font-medium text-secondary">{addressData.cityNameRaw }</p>
        </div>
        <div>
          <p className="text-xs font-bold text-neutral-400 uppercase">{dict?.adminSellerReview?.address?.cityCode }</p>
          <p className="font-mono text-sm text-secondary">{addressData.cityCode }</p>
        </div>
        <div>
          <p className="text-xs font-bold text-neutral-400 uppercase">{dict?.adminSellerReview?.address?.departmentCode }</p>
          <p className="font-mono text-sm text-secondary">{addressData.departmentCode }</p>
        </div>
        
        <div>
          <p className="text-xs font-bold text-neutral-400 uppercase">{dict?.adminSellerReview?.address?.citySource }</p>
          <span className="inline-block mt-1 px-2 py-1 bg-neutral-100 rounded text-xs font-medium">{addressData.citySource }</span>
        </div>
        <div>
          <p className="text-xs font-bold text-neutral-400 uppercase">{dict?.adminSellerReview?.address?.geoStatus }</p>
          <span className="inline-block mt-1 px-2 py-1 bg-neutral-100 rounded text-xs font-medium">{addressData.geoStatus }</span>
        </div>
        <div>
          <p className="text-xs font-bold text-neutral-400 uppercase">{dict?.adminSellerReview?.address?.coverageStatus }</p>
          <span className="inline-block mt-1 px-2 py-1 bg-neutral-100 rounded text-xs font-medium">{addressData.coverageStatus }</span>
        </div>
        
        <div>
          <p className="text-xs font-bold text-neutral-400 uppercase">{dict?.adminSellerReview?.address?.deliveryEligibility }</p>
          <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-medium ${addressData.deliveryEligibility === 'ELIGIBLE' ? 'bg-green-100 text-green-800' : 'bg-neutral-100'}`}>
            {addressData.deliveryEligibility }
          </span>
        </div>
        <div>
          <p className="text-xs font-bold text-neutral-400 uppercase">{dict?.adminSellerReview?.address?.addressSource }</p>
          <span className="inline-block mt-1 px-2 py-1 bg-neutral-100 rounded text-xs font-medium">{addressData.addressSource }</span>
        </div>
        <div>
          <p className="text-xs font-bold text-neutral-400 uppercase">{dict?.adminSellerReview?.address?.status }</p>
          <span className="inline-block mt-1 px-2 py-1 bg-neutral-100 rounded text-xs font-medium">{addressData.status }</span>
        </div>

        <div className="col-span-full border-t border-neutral-100 pt-4 mt-2 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-xs font-bold text-neutral-400 uppercase">{dict?.adminSellerReview?.address?.coordinates }</p>
            <p className="font-mono text-sm text-secondary mt-1">
              {addressData.latitude ? `${addressData.latitude}, ${addressData.longitude}` : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold text-neutral-400 uppercase">{dict?.adminSellerReview?.address?.gpsRequiredLater }</p>
            <p className="font-medium text-secondary mt-1">{addressData.gpsRequiredLater ? 'Yes' : 'No'}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-neutral-400 uppercase">{dict?.adminSellerReview?.address?.isPinManual }</p>
            <p className="font-medium text-secondary mt-1">{addressData.isPinManual ? 'Yes' : 'No'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
