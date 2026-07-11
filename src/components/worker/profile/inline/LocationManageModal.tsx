"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { usePhilippineLocations } from "@/hooks/usePhilippineLocations";
import { patchWorkerProfile } from "@/actions/worker/profile";
import { formatLocation } from "@/utils/locationFormatter";
import { ProfileModal } from "./ProfileModal";

interface LocationManageModalProps {
  open: boolean;
  onClose: () => void;
  initial: {
    region: string;
    province: string;
    city: string;
    addressLine1: string;
  };
  onSaved: (data: {
    region: string;
    province: string;
    city: string;
    addressLine1: string;
    location: string;
  }) => void;
}

export function LocationManageModal({
  open,
  onClose,
  initial,
  onSaved,
}: LocationManageModalProps) {
  const {
    isLoading: isLocationsLoading,
    regions,
    getProvincesForRegion,
    getCitiesForProvince,
  } = usePhilippineLocations();

  const [region, setRegion] = useState(initial.region);
  const [province, setProvince] = useState(initial.province);
  const [city, setCity] = useState(initial.city);
  const [addressLine1, setAddressLine1] = useState(initial.addressLine1);
  const [isPending, startTransition] = useTransition();

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!region || !province || !city) {
      toast.error("Please fill in Region, Province, and City.");
      return;
    }

    startTransition(async () => {
      const payload = {
        region,
        province,
        city,
        addressLine1: addressLine1.trim() || "",
      };
      const result = await patchWorkerProfile(payload);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      const formattedLocation = formatLocation(
        payload.addressLine1,
        payload.city,
        payload.province,
        payload.region
      );
      onSaved({
        ...payload,
        location: formattedLocation,
      });
      toast.success("Location updated successfully");
      onClose();
    });
  }

  return (
    <ProfileModal
      open={open}
      title="Location details"
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="location-manage-form"
            disabled={isPending || isLocationsLoading || !region || !province || !city}
            className="rounded-xl bg-[#006e2f] px-4 py-2 text-xs font-bold text-white hover:bg-[#005c26] disabled:opacity-60"
          >
            {isPending ? "Saving…" : "Save"}
          </button>
        </div>
      }
    >
      <form id="location-manage-form" onSubmit={handleSave} className="space-y-4">
        {isLocationsLoading ? (
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium py-4">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-600" />
            Loading Philippine location data...
          </div>
        ) : (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              Region *
              <select
                value={region}
                onChange={(e) => {
                  const val = e.target.value;
                  setRegion(val);
                  setProvince("");
                  setCity("");
                }}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="">Select Region</option>
                {regions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Province *
              <select
                value={province}
                onChange={(e) => {
                  const val = e.target.value;
                  setProvince(val);
                  setCity("");
                }}
                disabled={!region}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-50 disabled:opacity-60"
              >
                <option value="">Select Province</option>
                {getProvincesForRegion(region).map((p) => (
                  <option key={p.key} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-medium text-slate-700">
              City / Municipality *
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={!province}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-50 disabled:opacity-60"
              >
                <option value="">Select City / Municipality</option>
                {getCitiesForProvince(province).map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Address Line 1 (Optional)
              <input
                type="text"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                placeholder="e.g. House No., Street, Barangay"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              />
            </label>
          </div>
        )}
      </form>
    </ProfileModal>
  );
}
