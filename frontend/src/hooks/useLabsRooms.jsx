/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import api from "../services/api";

const STORAGE_KEY = "zepository-labs-rooms";
const LabsRoomsContext = createContext(null);

const readStoredState = () => {
  if (typeof window === "undefined") {
    return { customLabs: [] };
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}");

    return {
      customLabs: Array.isArray(parsed.customLabs) ? parsed.customLabs : [],
    };
  } catch {
    return { customLabs: [] };
  }
};

const createId = (prefix) => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const normalizeLab = (lab) => {
  const id = String(lab.lab_id ?? lab.id ?? createId("lab"));

  return {
    ...lab,
    id,
    lab_id: id,
    name: lab.name?.trim() || lab.lab_name?.trim() || "",
    lab_name: lab.lab_name?.trim() || lab.name?.trim() || "",
  };
};

const mergeLabs = (backendLabs, customLabs) => {
  const labMap = new Map();

  backendLabs.map(normalizeLab).forEach((lab) => {
    labMap.set(lab.lab_id, lab);
  });

  customLabs.map(normalizeLab).forEach((lab) => {
    const existing = labMap.get(lab.lab_id);
    labMap.set(lab.lab_id, existing ? { ...existing, ...lab } : lab);
  });

  return Array.from(labMap.values()).sort((left, right) =>
    left.lab_name.localeCompare(right.lab_name)
  );
};

export function LabsRoomsProvider({ children }) {
  const [backendLabs, setBackendLabs] = useState([]);
  const [customLabs, setCustomLabs] = useState(() =>
    readStoredState().customLabs.map(normalizeLab)
  );
  const [isLoading, setIsLoading] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return Boolean(window.localStorage.getItem("token"));
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ customLabs })
    );
  }, [customLabs]);

  useEffect(() => {
    let isActive = true;
    const token = window.localStorage.getItem("token");

    if (!token) {
      return;
    }

    api
      .get("/labs", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (!isActive) {
          return;
        }

        setBackendLabs(Array.isArray(res.data.labs) ? res.data.labs : []);
        setError("");
      })
      .catch((err) => {
        if (!isActive) {
          return;
        }

        console.error("Failed to load labs:", err);
        setError("Unable to load labs from the server.");
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  const labs = useMemo(
    () => mergeLabs(backendLabs, customLabs),
    [backendLabs, customLabs]
  );

  const addLab = async (input) => {
    const nextLab = normalizeLab({
      name: input.name,
    });

    const duplicate = labs.some(
      (lab) => lab.lab_name.toLowerCase() === nextLab.lab_name.toLowerCase()
    );

    if (duplicate) {
      throw new Error("A lab with the same name already exists.");
    }

    const token = window.localStorage.getItem("token");
    const response = await api.post(
      "/labs",
      {
        name: nextLab.lab_name,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const savedLab = normalizeLab(response.data.lab || nextLab);
    setCustomLabs((current) => {
      const filtered = current.filter(
        (lab) => String(lab.lab_id) !== String(savedLab.lab_id)
      );
      return [...filtered, savedLab];
    });

    setBackendLabs((current) => {
      const filtered = current.filter(
        (lab) => String(lab.lab_id) !== String(savedLab.lab_id)
      );
      return [...filtered, savedLab];
    });

    return savedLab;
  };

  const editLab = async (id, input) => {
    const nextLab = normalizeLab({
      id,
      name: input.name,
    });

    const duplicate = labs.some(
      (lab) => String(lab.lab_id) !== String(id) && lab.lab_name.toLowerCase() === nextLab.lab_name.toLowerCase()
    );

    if (duplicate) {
      throw new Error("Another lab with this name already exists.");
    }

    const token = window.localStorage.getItem("token");
    await api.put(
      `/labs/${id}`,
      {
        name: nextLab.lab_name,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    setCustomLabs((current) => {
      return current.map(lab => String(lab.lab_id) === String(id) ? { ...lab, ...nextLab } : lab);
    });

    setBackendLabs((current) => {
      return current.map(lab => String(lab.lab_id) === String(id) ? { ...lab, ...nextLab } : lab);
    });

    return nextLab;
  };

  const removeLab = async (id) => {
    const token = window.localStorage.getItem("token");
    try {
      await api.delete(`/labs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to delete lab");
    }

    setCustomLabs((current) => current.filter(lab => String(lab.lab_id) !== String(id)));
    setBackendLabs((current) => current.filter(lab => String(lab.lab_id) !== String(id)));
  };

  const value = {
    labs,
    addLab,
    editLab,
    removeLab,
    isLoading,
    error,
  };

  return (
    <LabsRoomsContext.Provider value={value}>
      {children}
    </LabsRoomsContext.Provider>
  );
}

export default function useLabsRooms() {
  const context = useContext(LabsRoomsContext);

  if (!context) {
    throw new Error("useLabsRooms must be used within LabsRoomsProvider.");
  }

  return context;
}
