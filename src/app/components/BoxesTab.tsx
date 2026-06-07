import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import tw from "twrnc";

type InventoryItem = {
  id: string;
  name: string;
  count: number;
  location: string;
};

const DEFAULT_INVENTORY = {
  boxes: ["2", "4", "6", "8", "10", "10X", "15", "Σ1", "Σ2", "ΜΝ"].map(
    (name) => ({ id: `box_${name}`, name, count: 0, location: "" }),
  ),
  trays: ["Μικρός Δίσκος", "Μεγάλος Δίσκος"].map((name) => ({
    id: `tray_${name}`,
    name,
    count: 0,
    location: "",
  })),
};

export default function BoxesTab() {
  const [activeSubTab, setActiveSubTab] = useState<"boxes" | "trays">("boxes");
  const [inventory, setInventory] = useState<{
    boxes: InventoryItem[];
    trays: InventoryItem[];
  }>(DEFAULT_INVENTORY);
  const [newItemName, setNewItemName] = useState("");
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Φόρτωση από την τοπική μνήμη
  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      const storedData = await AsyncStorage.getItem("zucchero_inventory");
      if (storedData) {
        setInventory(JSON.parse(storedData));
      }
    } catch (e) {
      console.error("Σφάλμα φόρτωσης αποθήκης:", e);
    }
  };

  const saveInventory = async (newInventory: typeof inventory) => {
    setInventory(newInventory);
    try {
      await AsyncStorage.setItem(
        "zucchero_inventory",
        JSON.stringify(newInventory),
      );
    } catch (e) {
      console.error("Σφάλμα αποθήκευσης:", e);
    }
  };

  // --- LOGIC ΓΙΑ ΤΑ ΚΟΥΜΠΙΑ ---
  const updateCount = (id: string, delta: number) => {
    const newInventory = { ...inventory };
    const list = newInventory[activeSubTab];
    const index = list.findIndex((item) => item.id === id);

    if (index !== -1) {
      let newCount = list[index].count + delta;
      if (newCount < 0) newCount = 0;
      if (newCount > 99) newCount = 99;
      list[index].count = newCount;
      saveInventory(newInventory);
    }
  };

  const handleManualCount = (id: string, text: string) => {
    const newInventory = { ...inventory };
    const list = newInventory[activeSubTab];
    const index = list.findIndex((item) => item.id === id);

    if (index !== -1) {
      let num = parseInt(text.replace(/[^0-9]/g, ""), 10);
      if (isNaN(num)) num = 0;
      if (num > 99) num = 99;
      list[index].count = num;
      saveInventory(newInventory);
    }
  };

  const updateLocation = (id: string, text: string) => {
    const newInventory = { ...inventory };
    const list = newInventory[activeSubTab];
    const index = list.findIndex((item) => item.id === id);

    if (index !== -1) {
      list[index].location = text;
      saveInventory(newInventory);
    }
  };

  const deleteItem = (id: string) => {
    Alert.alert("Διαγραφή", "Είσαι σίγουρος ότι θέλεις να το διαγράψεις;", [
      { text: "Ακύρωση", style: "cancel" },
      {
        text: "Διαγραφή",
        style: "destructive",
        onPress: () => {
          const newInventory = { ...inventory };
          newInventory[activeSubTab] = newInventory[activeSubTab].filter(
            (item) => item.id !== id,
          );
          saveInventory(newInventory);
        },
      },
    ]);
  };

  const addNewItem = () => {
    if (!newItemName.trim()) return;

    const newInventory = { ...inventory };
    newInventory[activeSubTab].push({
      id: `custom_${Date.now()}`,
      name: newItemName.trim(),
      count: 0,
      location: "",
    });

    saveInventory(newInventory);
    setNewItemName("");
    setIsAddingNew(false);
  };

  const currentList = inventory[activeSubTab];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={tw`flex-1`}
    >
      {/* --- SUB-TABS (Κουτιά / Δίσκοι) --- */}
      <View
        style={tw`flex-row bg-slate-200 p-1 rounded-2xl mb-6 mx-auto w-full max-w-sm`}
      >
        <TouchableOpacity
          onPress={() => setActiveSubTab("boxes")}
          style={tw`flex-1 py-3 rounded-xl items-center ${activeSubTab === "boxes" ? "bg-white shadow-sm" : "bg-transparent"}`}
        >
          <Text
            style={tw`font-bold ${activeSubTab === "boxes" ? "text-slate-900" : "text-slate-500"}`}
          >
            Κουτιά
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveSubTab("trays")}
          style={tw`flex-1 py-3 rounded-xl items-center ${activeSubTab === "trays" ? "bg-white shadow-sm" : "bg-transparent"}`}
        >
          <Text
            style={tw`font-bold ${activeSubTab === "trays" ? "text-slate-900" : "text-slate-500"}`}
          >
            Δίσκοι
          </Text>
        </TouchableOpacity>
      </View>

      {/* --- ΛΙΣΤΑ ΑΠΟΘΗΚΗΣ --- */}
      <ScrollView contentContainerStyle={tw`pb-20`}>
        {currentList.map((item) => (
          <View
            key={item.id}
            style={tw`bg-white border border-slate-200 rounded-2xl p-5 mb-4 shadow-sm`}
          >
            {/* Πάνω Σειρά: Όνομα & Μετρητής & Διαγραφή */}
            <View style={tw`flex-row items-center justify-between mb-4`}>
              <Text style={tw`text-xl font-black text-slate-800 flex-1`}>
                {item.name}
              </Text>

              <View style={tw`flex-row items-center gap-3`}>
                {/* Κουμπί Μείωσης */}
                <TouchableOpacity
                  onPress={() => updateCount(item.id, -1)}
                  style={tw`bg-slate-100 p-3 rounded-xl active:bg-slate-200`}
                >
                  <Feather name="minus" size={20} color="#0f172a" />
                </TouchableOpacity>

                {/* Input Αριθμού */}
                <TextInput
                  style={tw`bg-slate-50 border border-slate-200 text-center font-black text-xl rounded-xl w-16 h-12 text-slate-900`}
                  keyboardType="number-pad"
                  maxLength={2}
                  value={item.count.toString()}
                  onChangeText={(text) => handleManualCount(item.id, text)}
                />

                {/* Κουμπί Αύξησης */}
                <TouchableOpacity
                  onPress={() => updateCount(item.id, 1)}
                  style={tw`bg-[#97dcf5] p-3 rounded-xl active:bg-[#7bc8e6]`}
                >
                  <Feather name="plus" size={20} color="#0f172a" />
                </TouchableOpacity>

                {/* Κουμπί Διαγραφής */}
                <TouchableOpacity
                  onPress={() => deleteItem(item.id)}
                  style={tw`ml-2 p-3 bg-red-50 rounded-xl active:bg-red-100`}
                >
                  <Feather name="trash-2" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Κάτω Σειρά: Σημειώσεις (Δυναμικό ύψος) */}
            <View
              style={tw`bg-slate-50 border border-slate-200 rounded-xl px-4 py-2`}
            >
              <Text style={tw`text-xs font-bold text-slate-400 mb-1 uppercase`}>
                Τοποθεσία / Σημειώσεις
              </Text>
              <TextInput
                style={tw`text-slate-700 text-base min-h-[40px]`}
                multiline={true}
                placeholder="π.χ. Στο πατάρι, πίσω δεξιά..."
                placeholderTextColor="#94a3b8"
                value={item.location}
                onChangeText={(text) => updateLocation(item.id, text)}
              />
            </View>
          </View>
        ))}

        {/* --- ΠΡΟΣΘΗΚΗ ΝΕΟΥ --- */}
        {isAddingNew ? (
          <View
            style={tw`bg-indigo-50 border border-indigo-200 rounded-2xl p-5 mb-4`}
          >
            <Text style={tw`text-sm font-bold text-indigo-800 mb-2 uppercase`}>
              Όνομα Νέου Μεγέθους/Είδους
            </Text>
            <TextInput
              style={tw`bg-white border border-indigo-200 rounded-xl px-4 py-3 mb-4 text-slate-800 font-bold`}
              placeholder="π.χ. Τετράγωνο Μεγάλο"
              value={newItemName}
              onChangeText={setNewItemName}
              autoFocus
            />
            <View style={tw`flex-row gap-3`}>
              <TouchableOpacity
                onPress={() => setIsAddingNew(false)}
                style={tw`flex-1 bg-white border border-slate-200 py-3 rounded-xl items-center`}
              >
                <Text style={tw`font-bold text-slate-600`}>Ακύρωση</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={addNewItem}
                style={tw`flex-1 bg-indigo-600 py-3 rounded-xl items-center`}
              >
                <Text style={tw`font-bold text-white`}>Αποθήκευση</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => setIsAddingNew(true)}
            style={tw`border-2 border-dashed border-slate-300 rounded-2xl p-5 items-center justify-center flex-row gap-2 active:bg-slate-100`}
          >
            <Feather name="plus" size={24} color="#64748b" />
            <Text style={tw`font-bold text-slate-500 text-lg`}>
              Νέο Μέγεθος
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
