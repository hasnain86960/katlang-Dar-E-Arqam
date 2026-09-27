import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface BrandingContextType {
  logoUrl: string | null;
  institutionName: string;
  tagline: string;
  establishedYear: string;
  updateLogo: (newLogoUrl: string | null) => Promise<void>;
  resetLogo: () => Promise<void>;
  updateBrandingDetails: (name: string, tag: string) => Promise<void>;
}

const LOCAL_STORAGE_LOGO_KEY = 'dare_arqam_custom_logo';
const LOCAL_STORAGE_BRANDING_KEY = 'dare_arqam_branding_details';

const BrandingContext = createContext<BrandingContextType>({
  logoUrl: null,
  institutionName: 'DARE ARQAM',
  tagline: 'Official Educational Institution Portal',
  establishedYear: '1998',
  updateLogo: async () => {},
  resetLogo: async () => {},
  updateBrandingDetails: async () => {},
});

export const BrandingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize synchronously from localStorage for zero-flash high-speed rendering
  const [logoUrl, setLogoUrl] = useState<string | null>(() => {
    try {
      return localStorage.getItem(LOCAL_STORAGE_LOGO_KEY) || null;
    } catch {
      return null;
    }
  });

  const [institutionName, setInstitutionName] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_BRANDING_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.name || 'DARE ARQAM';
      }
    } catch {}
    return 'DARE ARQAM';
  });

  const [tagline, setTagline] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_BRANDING_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.tagline || 'Official Educational Institution Portal';
      }
    } catch {}
    return 'Official Educational Institution Portal';
  });

  // Sync with Firestore settings on boot
  useEffect(() => {
    let isMounted = true;

    const fetchBrandingFromFirestore = async () => {
      try {
        const brandingDoc = await getDoc(doc(db, 'settings', 'branding'));
        if (brandingDoc.exists() && isMounted) {
          const data = brandingDoc.data();
          if (data.logoUrl !== undefined) {
            setLogoUrl(data.logoUrl || null);
            if (data.logoUrl) {
              localStorage.setItem(LOCAL_STORAGE_LOGO_KEY, data.logoUrl);
            } else {
              localStorage.removeItem(LOCAL_STORAGE_LOGO_KEY);
            }
          }
          if (data.institutionName) {
            setInstitutionName(data.institutionName);
          }
          if (data.tagline) {
            setTagline(data.tagline);
          }
        }
      } catch (err) {
        // Silently use localStorage fallback if network/Firestore is unavailable
      }
    };

    fetchBrandingFromFirestore();
    return () => {
      isMounted = false;
    };
  }, []);

  const updateLogo = async (newLogoUrl: string | null) => {
    setLogoUrl(newLogoUrl);
    try {
      if (newLogoUrl) {
        localStorage.setItem(LOCAL_STORAGE_LOGO_KEY, newLogoUrl);
      } else {
        localStorage.removeItem(LOCAL_STORAGE_LOGO_KEY);
      }
    } catch (e) {
      console.warn('Could not save logo to localStorage:', e);
    }

    try {
      await setDoc(doc(db, 'settings', 'branding'), {
        logoUrl: newLogoUrl || '',
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (e) {
      console.warn('Could not persist custom logo to Firestore:', e);
    }
  };

  const resetLogo = async () => {
    await updateLogo(null);
  };

  const updateBrandingDetails = async (name: string, tag: string) => {
    setInstitutionName(name);
    setTagline(tag);
    try {
      localStorage.setItem(LOCAL_STORAGE_BRANDING_KEY, JSON.stringify({ name, tagline: tag }));
    } catch {}

    try {
      await setDoc(doc(db, 'settings', 'branding'), {
        institutionName: name,
        tagline: tag,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (e) {
      console.warn('Could not persist branding to Firestore:', e);
    }
  };

  return (
    <BrandingContext.Provider
      value={{
        logoUrl,
        institutionName,
        tagline,
        establishedYear: '1998',
        updateLogo,
        resetLogo,
        updateBrandingDetails,
      }}
    >
      {children}
    </BrandingContext.Provider>
  );
};

export const useBranding = () => useContext(BrandingContext);
