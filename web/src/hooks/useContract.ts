'use client';

import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { 
  CAMPUS_SHIELD_ABI, 
  CAMPUS_SHIELD_ADDRESS, 
  ERC20_ABI, 
  USDC_ADDRESS,
} from '@/lib/contracts';
import { useState, useEffect } from 'react';

// ============ USDC Hooks ============

export function useUSDCBalance() {
  const { address } = useAccount();
  
  return useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });
}

export function useUSDCAllowance() {
  const { address } = useAccount();
  
  return useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address ? [address, CAMPUS_SHIELD_ADDRESS] : undefined,
    query: {
      enabled: !!address,
    },
  });
}

export function useApproveUSDC() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  
  const approve = (amount: bigint) => {
    writeContract({
      address: USDC_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [CAMPUS_SHIELD_ADDRESS, amount],
    });
  };

  return { approve, hash, isPending, isConfirming, isSuccess, error };
}

// ============ CampusShield Read Hooks ============

export function useGetStats() {
  return useReadContract({
    address: CAMPUS_SHIELD_ADDRESS,
    abi: CAMPUS_SHIELD_ABI,
    functionName: 'getStats',
  });
}

export function useUniversityCount() {
  return useReadContract({
    address: CAMPUS_SHIELD_ADDRESS,
    abi: CAMPUS_SHIELD_ABI,
    functionName: 'universityCount',
  });
}

export function useGetUniversity(universityId: bigint) {
  return useReadContract({
    address: CAMPUS_SHIELD_ADDRESS,
    abi: CAMPUS_SHIELD_ABI,
    functionName: 'getUniversity',
    args: [universityId],
    query: {
      enabled: universityId > 0n,
    },
  });
}

export function useGetPendingRequests(universityId: bigint) {
  return useReadContract({
    address: CAMPUS_SHIELD_ADDRESS,
    abi: CAMPUS_SHIELD_ABI,
    functionName: 'getPendingRequests',
    args: [universityId],
    query: {
      enabled: universityId > 0n,
    },
  });
}

export function useGetStudentRequests() {
  const { address } = useAccount();
  
  const result = useReadContract({
    address: CAMPUS_SHIELD_ADDRESS,
    abi: CAMPUS_SHIELD_ABI,
    functionName: 'getStudentRequests',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      gcTime: 0,
      staleTime: 0,
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      retry: false,
    },
  });

  // Contract returns "0x" for empty arrays which wagmi treats as an error
  const hasEmptyDataError = result.error?.message?.includes('returned no data ("0x")');
  
  return {
    ...result,
    data: hasEmptyDataError ? [] : (result.data ?? []),
    isError: hasEmptyDataError ? false : result.isError,
    error: hasEmptyDataError ? null : result.error,
  };
}

export function useGetUniversityRequests(universityId: bigint) {
  return useReadContract({
    address: CAMPUS_SHIELD_ADDRESS,
    abi: CAMPUS_SHIELD_ABI,
    functionName: 'getUniversityRequests',
    args: [universityId],
    query: {
      enabled: universityId > 0n,
    },
  });
}

// ============ CampusShield Write Hooks ============

export function useRegisterUniversity() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const register = (name: string) => {
    writeContract({
      address: CAMPUS_SHIELD_ADDRESS,
      abi: CAMPUS_SHIELD_ABI,
      functionName: 'registerUniversity',
      args: [name],
    });
  };

  return { register, hash, isPending, isConfirming, isSuccess, error };
}

export function useDonate() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const donate = (universityId: bigint, amount: bigint) => {
    writeContract({
      address: CAMPUS_SHIELD_ADDRESS,
      abi: CAMPUS_SHIELD_ABI,
      functionName: 'donate',
      args: [universityId, amount],
    });
  };

  return { donate, hash, isPending, isConfirming, isSuccess, error };
}

export function useRequestAid() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const requestAid = (universityId: bigint, amount: bigint, reason: string) => {
    writeContract({
      address: CAMPUS_SHIELD_ADDRESS,
      abi: CAMPUS_SHIELD_ABI,
      functionName: 'requestAid',
      args: [universityId, amount, reason],
    });
  };

  return { requestAid, hash, isPending, isConfirming, isSuccess, error };
}

export function useApproveAid() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const approveAid = (requestId: bigint) => {
    writeContract({
      address: CAMPUS_SHIELD_ADDRESS,
      abi: CAMPUS_SHIELD_ABI,
      functionName: 'approveAid',
      args: [requestId],
    });
  };

  return { approveAid, hash, isPending, isConfirming, isSuccess, error };
}

export function useRejectAid() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const rejectAid = (requestId: bigint) => {
    writeContract({
      address: CAMPUS_SHIELD_ADDRESS,
      abi: CAMPUS_SHIELD_ABI,
      functionName: 'rejectAid',
      args: [requestId],
    });
  };

  return { rejectAid, hash, isPending, isConfirming, isSuccess, error };
}

// ============ Combined Donation Flow ============
// This hook handles the full donation flow: check allowance -> approve if needed -> donate

export function useDonationFlow() {
  const [step, setStep] = useState<'idle' | 'approving' | 'donating' | 'success' | 'error'>('idle');
  const [error, setError] = useState<Error | null>(null);
  
  const { data: allowance, refetch: refetchAllowance } = useUSDCAllowance();
  const { approve, isPending: isApproving, isSuccess: approvalSuccess, error: approvalError } = useApproveUSDC();
  const { donate, isPending: isDonating, isSuccess: donationSuccess, error: donationError } = useDonate();

  // Track approval and move to donation step
  useEffect(() => {
    if (approvalSuccess && step === 'approving') {
      refetchAllowance();
      setStep('donating');
    }
  }, [approvalSuccess, step, refetchAllowance]);

  // Track donation success
  useEffect(() => {
    if (donationSuccess && step === 'donating') {
      setStep('success');
    }
  }, [donationSuccess, step]);

  // Track errors
  useEffect(() => {
    if (approvalError) {
      setError(approvalError);
      setStep('error');
    }
    if (donationError) {
      setError(donationError);
      setStep('error');
    }
  }, [approvalError, donationError]);

  const startDonation = async (universityId: bigint, amount: bigint) => {
    setError(null);
    
    // Check if we need approval
    const currentAllowance = allowance ?? 0n;
    
    if (currentAllowance < amount) {
      setStep('approving');
      approve(amount);
    } else {
      setStep('donating');
      donate(universityId, amount);
    }
  };

  // When step is 'donating' and we just got approval, actually donate
  const executeDonation = (universityId: bigint, amount: bigint) => {
    donate(universityId, amount);
  };

  const reset = () => {
    setStep('idle');
    setError(null);
  };

  return {
    step,
    isApproving,
    isDonating,
    error,
    startDonation,
    executeDonation,
    reset,
    allowance,
  };
}
