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

type CategoryMeta = {
  id: string;
  title: string;
};

// Αυτά είναι τα default. Τα κρατάμε για να μην χτυπήσει error την πρώτη φορά.
const DEFAULT_CATEGORIES: CategoryMeta[] = [
  { id: "boxes", title: "Κουτιά" },
  { id: "trays", title: "Δίσκοι" },
];

const DEFAULT_INVENTORY: Record<string, InventoryItem[]> = {
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

export default function StorageTab() {
  // --- STATES ---
  const [categories, setCategories] =
    useState<CategoryMeta[]>(DEFAULT_CATEGORIES);
  const [activeSubTab, setActiveSubTab] = useState<string>("boxes");
  const [inventory, setInventory] =
    useState<Record<string, InventoryItem[]>>(DEFAULT_INVENTORY);

  // States για Νέο Προϊόν
  const [newItemName, setNewItemName] = useState("");
  const [isAddingNew, setIsAddingNew] = useState(false);

  // States για ΝΕΑ ΚΑΤΗΓΟΡΙΑ
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  // Φόρτωση από την τοπική μνήμη
  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      // 1. Φορτώνουμε τα δεδομένα των προϊόντων (παραμένουν άθικτα!)
      const storedData = await AsyncStorage.getItem("zucchero_inventory");
      if (storedData) {
        setInventory(JSON.parse(storedData));
      }

      // 2. Φορτώνουμε τις κατηγορίες (αν έχουν προσθέσει δικές τους)
      const storedCats = await AsyncStorage.getItem("zucchero_inventory_cats");
      if (storedCats) {
        setCategories(JSON.parse(storedCats));
      }
    } catch (e) {
      console.error("Σφάλμα φόρτωσης αποθήκης:", e);
    }
  };

  const saveInventory = async (
    newInventory: Record<string, InventoryItem[]>,
  ) => {
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

  const saveCategories = async (newCats: CategoryMeta[]) => {
    setCategories(newCats);
    try {
      await AsyncStorage.setItem(
        "zucchero_inventory_cats",
        JSON.stringify(newCats),
      );
    } catch (e) {
      console.error("Σφάλμα αποθήκευσης κατηγοριών:", e);
    }
  };

  // --- LOGIC ΓΙΑ ΤΑ ΚΟΥΜΠΙΑ ---
  const updateCount = (id: string, delta: number) => {
    const newInventory = { ...inventory };
    const list = newInventory[activeSubTab] || [];
    const index = list.findIndex((item) => item.id === id);

    if (index !== -1) {
      let newCount = list[index].count + delta;
      if (newCount < 0) newCount = 0;
      if (newCount > 999) newCount = 999;
      list[index].count = newCount;
      saveInventory(newInventory);
    }
  };

  const handleManualCount = (id: string, text: string) => {
    const newInventory = { ...inventory };
    const list = newInventory[activeSubTab] || [];
    const index = list.findIndex((item) => item.id === id);

    if (index !== -1) {
      let num = parseInt(text.replace(/[^0-9]/g, ""), 10);
      if (isNaN(num)) num = 0;
      if (num > 999) num = 999;
      list[index].count = num;
      saveInventory(newInventory);
    }
  };

  const updateLocation = (id: string, text: string) => {
    const newInventory = { ...inventory };
    const list = newInventory[activeSubTab] || [];
    const index = list.findIndex((item) => item.id === id);

    if (index !== -1) {
      list[index].location = text;
      saveInventory(newInventory);
    }
  };

  const deleteItem = (id: string) => {
    Alert.alert(
      "Διαγραφή",
      "Είσαι σίγουρος ότι θέλεις να διαγράψεις αυτό το είδος;",
      [
        { text: "Ακύρωση", style: "cancel" },
        {
          text: "Διαγραφή",
          style: "destructive",
          onPress: () => {
            const newInventory = { ...inventory };
            newInventory[activeSubTab] = (
              newInventory[activeSubTab] || []
            ).filter((item) => item.id !== id);
            saveInventory(newInventory);
          },
        },
      ],
    );
  };

  // Η ΝΕΑ ΣΥΝΑΡΤΗΣΗ ΔΙΑΓΡΑΦΗΣ ΚΑΤΗΓΟΡΙΑΣ!
  const deleteCategory = (idToDelete: string, catTitle: string) => {
    Alert.alert(
      "Διαγραφή Κατηγορίας",
      `Σίγουρα θέλεις να διαγράψεις την κατηγορία "${catTitle}" και ΟΛΑ τα είδη της;`,
      [
        { text: "Ακύρωση", style: "cancel" },
        {
          text: "Διαγραφή",
          style: "destructive",
          onPress: () => {
            // 1. Σβήνουμε την κατηγορία από τη λίστα
            const newCats = categories.filter((c) => c.id !== idToDelete);
            saveCategories(newCats);

            // 2. Σβήνουμε όλα τα είδη της από το inventory για να μην πιάνουν χώρο
            const newInventory = { ...inventory };
            delete newInventory[idToDelete];
            saveInventory(newInventory);

            // 3. Αλλάζουμε το tab σε κάποιο διαθέσιμο (αν υπάρχει)
            setActiveSubTab(newCats.length > 0 ? newCats[0].id : "");
          },
        },
      ],
    );
  };

  const addNewItem = () => {
    if (!newItemName.trim()) return;

    const newInventory = { ...inventory };
    if (!newInventory[activeSubTab]) {
      newInventory[activeSubTab] = [];
    }

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

  const addNewCategory = () => {
    if (!newCategoryName.trim()) return;

    const newId = `cat_${Date.now()}`;
    const newCats = [
      ...categories,
      { id: newId, title: newCategoryName.trim() },
    ];

    saveCategories(newCats);

    const newInventory = { ...inventory, [newId]: [] };
    saveInventory(newInventory);

    setNewCategoryName("");
    setIsAddingCategory(false);
    setActiveSubTab(newId);
  };

  const currentList = inventory[activeSubTab] || [];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={tw`flex-1`}
    >
      {/* --- OΡΙΖΟΝΤΙΑ ΛΙΣΤΑ ΚΑΤΗΓΟΡΙΩΝ (TABS) --- */}
      <View style={tw`mb-4`}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={tw`flex-row items-center gap-2 p-1 bg-slate-200 rounded-2xl`}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => setActiveSubTab(cat.id)}
              style={tw`flex-row items-center gap-2 py-3 px-5 rounded-xl ${
                activeSubTab === cat.id
                  ? "bg-white shadow-sm"
                  : "bg-transparent"
              }`}
            >
              <Text
                style={tw`font-bold ${
                  activeSubTab === cat.id ? "text-slate-900" : "text-slate-500"
                }`}
              >
                {cat.title}
              </Text>

              {/* ΤΟ ΝΕΟ ΚΟΥΜΠΙ ΔΙΑΓΡΑΦΗΣ ΠΟΥ ΕΜΦΑΝΙΖΕΤΑΙ ΜΟΝΟ ΟΤΑΝ ΕΙΝΑΙ ΕΠΙΛΕΓΜΕΝΟ */}
              {activeSubTab === cat.id && (
                <TouchableOpacity
                  onPress={() => deleteCategory(cat.id, cat.title)}
                  style={tw`ml-1 bg-red-50 p-1 rounded-md`}
                >
                  <Feather name="trash-2" size={14} color="#ef4444" />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          ))}

          {/* Το Κουμπί "+" για Νέα Κατηγορία */}
          <TouchableOpacity
            onPress={() => setIsAddingCategory(true)}
            style={tw`py-3 px-4 bg-slate-100 rounded-xl border border-dashed border-slate-400 items-center justify-center ml-2`}
          >
            <Feather name="plus" size={20} color="#475569" />
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* --- ΠΡΟΣΘΗΚΗ ΝΕΑΣ ΚΑΤΗΓΟΡΙΑΣ (Μικρό Panel) --- */}
      {isAddingCategory && (
        <View
          style={tw`bg-indigo-50 border border-indigo-200 rounded-2xl p-4 mb-6`}
        >
          <Text style={tw`text-sm font-bold text-indigo-800 mb-2 uppercase`}>
            Όνομα Νέας Κατηγορίας
          </Text>
          <TextInput
            style={tw`bg-white border border-indigo-200 rounded-xl px-4 py-3 mb-3 text-slate-800 font-bold`}
            placeholder="π.χ. Παγωτά, Ποτήρια..."
            value={newCategoryName}
            onChangeText={setNewCategoryName}
            autoFocus
          />
          <View style={tw`flex-row gap-3`}>
            <TouchableOpacity
              onPress={() => setIsAddingCategory(false)}
              style={tw`flex-1 bg-white border border-slate-200 py-3 rounded-xl items-center`}
            >
              <Text style={tw`font-bold text-slate-600`}>Ακύρωση</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={addNewCategory}
              style={tw`flex-1 bg-indigo-600 py-3 rounded-xl items-center`}
            >
              <Text style={tw`font-bold text-white`}>Δημιουργία</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* --- ΛΙΣΤΑ ΑΠΟΘΗΚΗΣ ΤΗΣ ΕΝΕΡΓΗΣ ΚΑΤΗΓΟΡΙΑΣ --- */}
      <ScrollView contentContainerStyle={tw`pb-20`}>
        {currentList.length === 0 && !isAddingNew && activeSubTab !== "" && (
          <View style={tw`items-center justify-center py-10`}>
            <Feather name="inbox" size={48} color="#cbd5e1" />
            <Text style={tw`text-slate-400 font-bold mt-4 text-center`}>
              Αυτή η κατηγορία είναι άδεια.{"\n"}Πάτα "Νέο Είδος" για να
              ξεκινήσεις.
            </Text>
          </View>
        )}

        {activeSubTab === "" && (
          <View style={tw`items-center justify-center py-10`}>
            <Feather name="alert-circle" size={48} color="#cbd5e1" />
            <Text style={tw`text-slate-400 font-bold mt-4 text-center`}>
              Δεν υπάρχουν κατηγορίες. Φτιάξε μία νέα!
            </Text>
          </View>
        )}

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
                <TouchableOpacity
                  onPress={() => updateCount(item.id, -1)}
                  style={tw`bg-slate-100 p-3 rounded-xl active:bg-slate-200`}
                >
                  <Feather name="minus" size={20} color="#0f172a" />
                </TouchableOpacity>

                <TextInput
                  style={tw`bg-slate-50 border border-slate-200 text-center font-bold text-lg rounded-xl w-16 h-12 text-slate-900`}
                  keyboardType="number-pad"
                  maxLength={3}
                  value={item.count.toString()}
                  onChangeText={(text) => handleManualCount(item.id, text)}
                />

                <TouchableOpacity
                  onPress={() => updateCount(item.id, 1)}
                  style={tw`bg-[#97dcf5] p-3 rounded-xl active:bg-[#7bc8e6]`}
                >
                  <Feather name="plus" size={20} color="#0f172a" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => deleteItem(item.id)}
                  style={tw`ml-2 p-3 bg-red-50 rounded-xl active:bg-red-100`}
                >
                  <Feather name="trash-2" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Κάτω Σειρά: Σημειώσεις */}
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

        {/* --- ΠΡΟΣΘΗΚΗ ΝΕΟΥ ΕΙΔΟΥΣ --- */}
        {isAddingNew && activeSubTab !== "" && (
          <View
            style={tw`bg-emerald-50 border border-emerald-200 rounded-2xl p-5 mb-4 mt-2`}
          >
            <Text style={tw`text-sm font-bold text-emerald-800 mb-2 uppercase`}>
              Όνομα Νέου Είδους
            </Text>
            <TextInput
              style={tw`bg-white border border-emerald-200 rounded-xl px-4 py-3 mb-4 text-slate-800 font-bold`}
              placeholder="π.χ. Τετράγωνο Μεγάλο, Ποτήρια Espresso..."
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
                style={tw`flex-1 bg-emerald-500 py-3 rounded-xl items-center`}
              >
                <Text style={tw`font-bold text-white`}>Αποθήκευση</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {!isAddingNew && activeSubTab !== "" && (
          <TouchableOpacity
            onPress={() => setIsAddingNew(true)}
            style={tw`border-2 border-dashed border-slate-300 rounded-2xl p-5 items-center justify-center flex-row gap-2 mt-2 active:bg-slate-100`}
          >
            <Feather name="plus" size={24} color="#64748b" />
            <Text style={tw`font-bold text-slate-500 text-lg`}>Νέο Είδος</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
