"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VocabRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/play/vocab');
  }, [router]);
  
  return null;
}
