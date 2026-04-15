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
    return { customLabs: [], rooms: [] };
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}");

    return {
      customLabs: Array.isArray(parsed.customLabs) ? parsed.customLabs : [],
      rooms: Array.isArray(parsed.rooms) ? parsed.rooms : [],
    };
  } catch {
    return { customLabs: [], rooms: [] };
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
  const building = lab.building?.trim() || lab.block?.trim() || "";
  const metadata = typeof lab.metadata === "string" ? lab.metadata.trim() : "";
  const capacityValue = Number(lab.capacity);
  const capacity =
    Number.isFinite(capacityValue) && capacityValue > 0 ? capacityValue : null;

  return {
    ...lab,
    id,
    lab_id: id,
    name: lab.name?.trim() || lab.lab_name?.trim() || "",
    lab_name: lab.lab_name?.trim() || lab.name?.trim() || "",
    building,
    block: building,
    metadata,
    capacity,
  };
};

const normalizeRoom = (room) => {
  const id = String(room.id ?? createId("room"));
  const capacityValue = Number(room.capacity);
  const capacity =
    Number.isFinite(capacityValue) && capacityValue > 0 ? capacityValue : null;

  return {
    ...room,
    id,
    name: room.name?.trim() || room.room_name?.trim() || "",
    room_name: room.room_name?.trim() || room.name?.trim() || "",
    type: room.type?.trim() || "",
    block: room.block?.trim() || room.building?.trim() || "",
    metadata: typeof room.metadata === "string" ? room.metadata.trim() : "",
    capacity,
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
  const [rooms, setRooms] = useState(() =>
    readStoredState().rooms.map(normalizeRoom)
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
      JSON.stringify({ customLabs, rooms })
    );
  }, [customLabs, rooms]);

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
      capacity: input.capacity,
      building: input.building,
      metadata: input.metadata,
    });

    const duplicate = labs.some(
      (lab) =>
        lab.lab_name.toLowerCase() === nextLab.lab_name.toLowerCase() &&
        lab.building.toLowerCase() === nextLab.building.toLowerCase()
    );

    if (duplicate) {
      throw new Error("A lab with the same name and block/building already exists.");
    }

    const token = window.localStorage.getItem("token");
    const response = await api.post(
      "/labs",
      {
        name: nextLab.lab_name,
        capacity: nextLab.capacity,
        building: nextLab.building,
        metadata: nextLab.metadata,
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

  const addRoom = async (input) => {
    const nextRoom = normalizeRoom({
      id: createId("room"),
      name: input.name,
      capacity: input.capacity,
      type: input.type,
      block: input.block,
      metadata: input.metadata,
    });

    const duplicate = rooms.some(
      (room) =>
        room.name.toLowerCase() === nextRoom.name.toLowerCase() &&
        room.block.toLowerCase() === nextRoom.block.toLowerCase()
    );

    if (duplicate) {
      throw new Error("A room with the same name/number and block already exists.");
    }

    setRooms((current) => [...current, nextRoom]);
    return nextRoom;
  };

  const value = {
    labs,
    rooms,
    addLab,
    addRoom,
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
