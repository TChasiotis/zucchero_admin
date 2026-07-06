//npx eas build --platform android --profile preview για να φτιαχτει το apk preview

import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Pressable,
  Text,
  TextInput, // <-- ΠΡΟΣΤΕΘΗΚΕ ΓΙΑ ΤΟ INPUT ΤΟΥ FEE
  TouchableOpacity,
  View,
} from "react-native";
import tw from "twrnc";

import CategoriesTab from "./components/CategoriesTab";
import EditProductModal from "./components/EditProductModal";
import NewProductTab from "./components/NewProductTab";
import ProductsTab from "./components/ProductsTab";
import StorageTab from "./components/StorageTab";

const { width } = Dimensions.get("window");
const DRAWER_WIDTH = 300;

// ΠΡΟΣΤΕΘΗΚΕ ΤΟ ΝΕΟ TAB "ΡΥΘΜΙΣΕΙΣ" ΣΤΟ ΤΕΛΟΣ!
const ADMIN_TABS = [
  { id: "categories", label: "Κατηγορίες", icon: "list" },
  { id: "products", label: "Προϊόντα", icon: "box" },
  { id: "new_product", label: "Νέο Προϊόν", icon: "plus-circle" },
  { id: "storage", label: "Αποθήκη", icon: "archive" },
  { id: "settings", label: "Ρυθμίσεις", icon: "settings" },
];

export default function AdminDashboard() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;

  const [activeAdminTab, setActiveAdminTab] = useState(ADMIN_TABS[1].id);
  const [categories, setCategories] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFoodCategory, setSelectedFoodCategory] = useState<
    string | null
  >(null);

  // STATE ΓΙΑ ΤΟ SERVICE FEE!
  const [currentServiceFee, setCurrentServiceFee] = useState<string>("0.50");

  const [pendingChanges, setPendingChanges] = useState<Record<string, any>>({});

  // --- STATES ΓΙΑ ΤΟ MODAL ---
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [tempName, setTempName] = useState("");
  const [tempDesc, setTempDesc] = useState("");
  const [tempPrice, setTempPrice] = useState("");
  const [tempUnit, setTempUnit] = useState<string | null>(null);
  const [tempSoldOut, setTempSoldOut] = useState(false);
  const [tempPopular, setTempPopular] = useState(false);
  const [tempVegan, setTempVegan] = useState(false);
  const [tempGlutenFree, setTempGlutenFree] = useState(false);
  const [tempEgg, setTempEgg] = useState(false);
  const [tempDairy, setTempDairy] = useState(false);
  const [tempNuts, setTempNuts] = useState(false);
  const [tempSoy, setTempSoy] = useState(false);

  const [usageStats, setUsageStats] = useState({ commits: 0, aiRequests: 0 });
  const LIMITS = { commits: 50, aiRequests: 20 };

  useEffect(() => {
    fetchMenuData();
    checkDailyStats();
  }, []);

  const checkDailyStats = async () => {
    try {
      const today = new Date().toDateString();
      const storedData = await AsyncStorage.getItem("admin_usage_stats");
      if (storedData) {
        const { date, commits, aiRequests } = JSON.parse(storedData);
        if (date === today) setUsageStats({ commits, aiRequests });
        else {
          const resetData = { date: today, commits: 0, aiRequests: 0 };
          await AsyncStorage.setItem(
            "admin_usage_stats",
            JSON.stringify(resetData),
          );
          setUsageStats({ commits: 0, aiRequests: 0 });
        }
      } else {
        await AsyncStorage.setItem(
          "admin_usage_stats",
          JSON.stringify({ date: today, commits: 0, aiRequests: 0 }),
        );
      }
    } catch (e) {
      console.error("Σφάλμα:", e);
    }
  };

  const incrementAiUsage = async () => {
    const newStats = { ...usageStats, aiRequests: usageStats.aiRequests + 1 };
    setUsageStats(newStats);
    await AsyncStorage.setItem(
      "admin_usage_stats",
      JSON.stringify({ ...newStats, date: new Date().toDateString() }),
    );
  };

  const fetchMenuData = async () => {
    try {
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/api/menu`,
      );
      if (response.data.success) {
        setCategories(response.data.categories);
        setMenuItems(response.data.items);

        // ΤΡΑΒΑΜΕ ΤΟ SERVICE FEE ΑΠΟ ΤΟ API ΠΟΥ ΦΤΙΑΞΑΜΕ!
        if (response.data.serviceFee !== undefined) {
          setCurrentServiceFee(response.data.serviceFee.toString());
        }

        if (response.data.categories.length > 0)
          setSelectedFoodCategory(response.data.categories[0].id);
      }
    } catch (error) {
      alert("Αποτυχία σύνδεσης API!");
    } finally {
      setIsLoading(false);
    }
  };

  // HANDLER ΟΤΑΝ ΑΛΛΑΖΕΙ ΤΟ SERVICE FEE ΣΤΟ INPUT
  const handleServiceFeeChange = (val: string) => {
    setCurrentServiceFee(val);
    const parsed = parseFloat(val.replace(",", "."));

    if (!isNaN(parsed)) {
      setPendingChanges((prev) => ({
        ...prev,
        // Δημιουργούμε ένα "εικονικό" id για τις αλλαγές
        serviceFeeUpdate: {
          isServiceFeeUpdate: true,
          serviceFee: parsed,
        },
      }));
    }
  };

  const toggleDrawer = () => {
    if (isDrawerOpen)
      Animated.timing(slideAnim, {
        toValue: -DRAWER_WIDTH,
        duration: 250,
        useNativeDriver: true,
      }).start(() => setIsDrawerOpen(false));
    else {
      setIsDrawerOpen(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  };

  const getSortedActiveItems = () => {
    return menuItems
      .filter((item) =>
        selectedFoodCategory === "popular"
          ? item.isPopular
          : item.categoryId === selectedFoodCategory,
      )
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  };

  const reassignSortOrders = (catItems: any[]) => {
    const changes: Record<string, any> = {};
    const updatedMenu = menuItems.map((item) => {
      const indexInCat = catItems.findIndex((ci) => ci.id === item.id);

      if (indexInCat !== -1) {
        changes[item.id] = {
          id: item.id,
          price: item.price,
          isSoldOut: item.isSoldOut || false,
          isPopular: item.isPopular || false,
          isVegan: item.isVegan || false,
          isGlutenFree: item.isGlutenFree || false,
          hasEgg: item.hasEgg || false,
          hasDairy: item.hasDairy || false,
          hasNuts: item.hasNuts || false,
          hasSoy: item.hasSoy || false,
          ...pendingChanges[item.id],
          sortOrder: indexInCat,
          isCategoryUpdate: false,
        };

        if (item.translations) {
          changes[item.id].translations = item.translations;
        }

        return { ...item, sortOrder: indexInCat };
      }
      return item;
    });

    setMenuItems(updatedMenu);
    if (Object.keys(changes).length > 0) {
      setPendingChanges((prev) => ({ ...prev, ...changes }));
    }
  };

  const moveItemUp = (itemId: string) => {
    const catItems = [...getSortedActiveItems()];
    const index = catItems.findIndex((i) => i.id === itemId);
    if (index > 0) {
      const temp = catItems[index - 1];
      catItems[index - 1] = catItems[index];
      catItems[index] = temp;
      reassignSortOrders(catItems);
    }
  };

  const moveItemDown = (itemId: string) => {
    const catItems = [...getSortedActiveItems()];
    const index = catItems.findIndex((i) => i.id === itemId);
    if (index !== -1 && index < catItems.length - 1) {
      const temp = catItems[index + 1];
      catItems[index + 1] = catItems[index];
      catItems[index] = temp;
      reassignSortOrders(catItems);
    }
  };

  const moveItemToTop = (itemId: string) => {
    const catItems = [...getSortedActiveItems()];
    const index = catItems.findIndex((i) => i.id === itemId);
    if (index > 0) {
      const [itemToMove] = catItems.splice(index, 1);
      catItems.unshift(itemToMove);
      reassignSortOrders(catItems);
    }
  };

  const moveItemToBottom = (itemId: string) => {
    const catItems = [...getSortedActiveItems()];
    const index = catItems.findIndex((i) => i.id === itemId);
    if (index !== -1 && index < catItems.length - 1) {
      const [itemToMove] = catItems.splice(index, 1);
      catItems.push(itemToMove);
      reassignSortOrders(catItems);
    }
  };

  const moveCategory = (categoryId: string, direction: "up" | "down") => {
    let sorted = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);
    const index = sorted.findIndex((c) => c.id === categoryId);
    if (
      index === -1 ||
      (direction === "up" && index === 0) ||
      (direction === "down" && index === sorted.length - 1)
    )
      return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const currentCat = sorted[index];
    const targetCat = sorted[targetIndex];
    const updatedCategories = categories.map((cat) => {
      if (cat.id === currentCat.id)
        return { ...cat, sortOrder: targetCat.sortOrder };
      if (cat.id === targetCat.id)
        return { ...cat, sortOrder: currentCat.sortOrder };
      return cat;
    });
    setCategories(updatedCategories);
    setPendingChanges((prev) => ({
      ...prev,
      [currentCat.id]: {
        ...prev[currentCat.id],
        id: currentCat.id,
        sortOrder: targetCat.sortOrder,
        isCategoryUpdate: true,
      },
      [targetCat.id]: {
        ...prev[targetCat.id],
        id: targetCat.id,
        sortOrder: currentCat.sortOrder,
        isCategoryUpdate: true,
      },
    }));
  };

  const toggleCategoryVisibility = (
    categoryId: string,
    currentStatus: boolean,
  ) => {
    const newStatus = !currentStatus;
    setCategories(
      categories.map((cat) =>
        cat.id === categoryId ? { ...cat, isNotAvailable: newStatus } : cat,
      ),
    );
    setPendingChanges((prev) => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        id: categoryId,
        isNotAvailable: newStatus,
        isCategoryUpdate: true,
      },
    }));
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    setTempName(item.translations?.el?.name || "");
    setTempDesc(item.translations?.el?.description || "");
    setTempPrice(item.price ? item.price.toString() : "0");
    setTempUnit(item.unit || null);
    setTempSoldOut(item.isSoldOut || false);
    setTempPopular(item.isPopular || false);

    setTempVegan(item.isVegan || false);
    setTempGlutenFree(item.isGlutenFree || false);
    setTempEgg(item.hasEgg || false);
    setTempDairy(item.hasDairy || false);
    setTempNuts(item.hasNuts || false);
    setTempSoy(item.hasSoy || false);
    setIsEditModalVisible(true);
  };

  const handleTogglePopular = (value: boolean) => {
    if (
      value === true &&
      menuItems.filter((i) => i.isPopular && i.id !== editingItem?.id).length >=
        10
    ) {
      Alert.alert("Όριο", "Έχεις ήδη 10 δημοφιλή προϊόντα!");
      return;
    }
    setTempPopular(value);
  };

  const saveLocalChanges = () => {
    if (!editingItem) return;

    setMenuItems(
      menuItems.map((item) =>
        item.id === editingItem.id
          ? {
              ...item,
              price: parseFloat(tempPrice) || 0,
              unit: tempUnit,
              isSoldOut: tempSoldOut,
              isPopular: tempPopular,
              isVegan: tempVegan,
              isGlutenFree: tempGlutenFree,
              hasEgg: tempEgg,
              hasDairy: tempDairy,
              hasNuts: tempNuts,
              hasSoy: tempSoy,
              translations: {
                ...item.translations,
                el: { name: tempName, description: tempDesc },
              },
            }
          : item,
      ),
    );

    setPendingChanges((prev) => ({
      ...prev,
      [editingItem.id]: {
        ...prev[editingItem.id],
        id: editingItem.id,
        price: parseFloat(tempPrice) || 0,
        unit: tempUnit,
        isSoldOut: tempSoldOut,
        isPopular: tempPopular,
        isVegan: tempVegan,
        isGlutenFree: tempGlutenFree,
        hasEgg: tempEgg,
        hasDairy: tempDairy,
        hasNuts: tempNuts,
        hasSoy: tempSoy,
        isCategoryUpdate: false,
        translations: {
          ...(editingItem.translations || {}),
          el: { name: tempName, description: tempDesc },
        },
      },
    }));

    setIsEditModalVisible(false);
  };

  const handleDeleteCustomItem = () => {
    if (!editingItem) return;

    Alert.alert(
      "Διαγραφή",
      `Θέλεις να διαγράψεις οριστικά το προϊόν "${tempName}";`,
      [
        { text: "Ακύρωση", style: "cancel" },
        {
          text: "Διαγραφή",
          style: "destructive",
          onPress: () => {
            setMenuItems(menuItems.filter((i) => i.id !== editingItem.id));
            setPendingChanges((prev) => ({
              ...prev,
              [editingItem.id]: {
                id: editingItem.id,
                isDeleted: true,
              },
            }));
            setIsEditModalVisible(false);
          },
        },
      ],
    );
  };

  const handleBatchSubmit = async () => {
    if (usageStats.commits >= LIMITS.commits) {
      Alert.alert("Όριο Ημέρας", "Έφτασες το όριο!");
      return;
    }
    const changesArray = Object.values(pendingChanges);
    if (changesArray.length === 0) return;
    Alert.alert("Επιβεβαίωση", "Υποβολή αλλαγών;", [
      { text: "Ακύρωση", style: "cancel" },
      {
        text: "Υποβολή",
        onPress: async () => {
          try {
            const response = await axios.post(
              `${process.env.EXPO_PUBLIC_API_URL}/api/menu/update`,
              changesArray,
            );
            if (response.data.success) {
              alert("Επιτυχία!");
              setPendingChanges({});
              const newStats = {
                ...usageStats,
                commits: usageStats.commits + 1,
              };
              setUsageStats(newStats);
              await AsyncStorage.setItem(
                "admin_usage_stats",
                JSON.stringify({
                  ...newStats,
                  date: new Date().toDateString(),
                }),
              );
            }
          } catch (e) {
            alert("Σφάλμα δικτύου");
          }
        },
      },
    ]);
  };

  const activeItems = getSortedActiveItems();
  const activeTabDetails = ADMIN_TABS.find((t) => t.id === activeAdminTab);

  const sortedCategories = [...categories].sort(
    (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0),
  );

  if (isLoading)
    return (
      <View style={tw`flex-1 items-center justify-center`}>
        <ActivityIndicator size="large" color="#97dcf5" />
      </View>
    );

  return (
    <View style={tw`flex-1 bg-slate-50`}>
      <View style={tw`bg-white border-b border-slate-200 px-6 py-4 z-10`}>
        <View
          style={tw`flex-row flex-wrap items-center justify-between gap-y-4`}
        >
          <View style={tw`flex-row items-center gap-4`}>
            <TouchableOpacity
              onPress={toggleDrawer}
              style={tw`p-2 bg-slate-100 rounded-lg`}
            >
              <Feather name="menu" size={28} color="#0f172a" />
            </TouchableOpacity>
            <Text style={tw`text-2xl font-black text-slate-900 tracking-wide`}>
              ZUCCHERO <Text style={tw`text-[#97dcf5]`}>ADMIN</Text>
            </Text>
          </View>

          <View style={tw`flex-row flex-wrap items-center gap-3`}>
            <View
              style={tw`flex-row items-center gap-2 bg-slate-100 px-4 py-2 rounded-full`}
            >
              <Feather
                name={activeTabDetails?.icon as any}
                size={18}
                color="#475569"
              />
              <Text style={tw`text-slate-600 font-bold`}>
                {activeTabDetails?.label}
              </Text>
            </View>

            <View style={tw`flex-row gap-2`}>
              <View style={tw`px-3 py-1 bg-slate-200 rounded-full`}>
                <Text style={tw`text-slate-600 text-xs font-bold`}>
                  DB: {usageStats.commits}/{LIMITS.commits}
                </Text>
              </View>
              <View style={tw`px-3 py-1 bg-indigo-100 rounded-full`}>
                <Text style={tw`text-indigo-600 text-xs font-bold`}>
                  AI: {usageStats.aiRequests}/{LIMITS.aiRequests}
                </Text>
              </View>
            </View>

            {Object.keys(pendingChanges).length > 0 && (
              <TouchableOpacity
                onPress={handleBatchSubmit}
                style={tw`flex-row items-center gap-2 bg-emerald-500 px-4 py-2 rounded-full shadow-sm`}
              >
                <Feather name="upload-cloud" size={18} color="white" />
                <Text style={tw`text-white font-bold`}>
                  Υποβολή ({Object.keys(pendingChanges).length})
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      <View style={tw`flex-1 p-6`}>
        {activeAdminTab === "products" && (
          <ProductsTab
            sortedCategories={sortedCategories}
            activeItems={activeItems}
            selectedFoodCategory={selectedFoodCategory}
            setSelectedFoodCategory={setSelectedFoodCategory}
            openEditModal={openEditModal}
            moveItemUp={moveItemUp}
            moveItemDown={moveItemDown}
            moveItemToTop={moveItemToTop}
            moveItemToBottom={moveItemToBottom}
          />
        )}
        {activeAdminTab === "categories" && (
          <CategoriesTab
            sortedCategories={sortedCategories}
            moveCategory={moveCategory}
            toggleCategoryVisibility={toggleCategoryVisibility}
          />
        )}
        {activeAdminTab === "new_product" && (
          <NewProductTab
            sortedCategories={sortedCategories}
            menuItems={menuItems}
            usageStats={usageStats}
            LIMITS={LIMITS}
            incrementAiUsage={incrementAiUsage}
            setPendingChanges={setPendingChanges}
          />
        )}

        {activeAdminTab === "storage" && <StorageTab />}

        {/* --- ΕΔΩ ΕΙΝΑΙ ΤΟ ΝΕΟ TAB ΓΙΑ ΤΙΣ ΡΥΘΜΙΣΕΙΣ (SERVICE FEE) --- */}
        {activeAdminTab === "settings" && (
          <View
            style={tw`flex-1 p-6 bg-white rounded-2xl shadow-sm border border-slate-100`}
          >
            <Text style={tw`text-2xl font-black text-slate-800 mb-6`}>
              Γενικές Ρυθμίσεις Καταστήματος
            </Text>

            <View
              style={tw`p-6 bg-slate-50 rounded-xl border border-slate-200 w-full max-w-md`}
            >
              <Text style={tw`text-lg font-bold text-slate-700 mb-2`}>
                Service Fee (Εξτρά χρέωση τραπεζιού ανά παραγγελία)
              </Text>

              <View
                style={tw`flex-row items-center bg-white border border-slate-300 rounded-lg px-4 py-1`}
              >
                <Text style={tw`text-2xl font-black text-slate-400 mr-3`}>
                  €
                </Text>
                <TextInput
                  style={tw`flex-1 text-2xl font-bold text-slate-800 py-3`}
                  value={currentServiceFee}
                  onChangeText={handleServiceFeeChange}
                  keyboardType="numeric"
                  placeholder="0.50"
                />
              </View>

              {pendingChanges["serviceFeeUpdate"] && (
                <View
                  style={tw`flex-row items-center gap-2 mt-4 bg-emerald-50 p-3 rounded-lg border border-emerald-200`}
                >
                  <Feather name="info" size={16} color="#059669" />
                  <Text style={tw`text-emerald-700 font-bold flex-1`}>
                    Αλλάξατε το Service Fee! Μην ξεχάσετε να πατήσετε "Υποβολή".
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
      </View>

      <EditProductModal
        visible={isEditModalVisible}
        editingItem={editingItem}
        onClose={() => setIsEditModalVisible(false)}
        tempName={tempName}
        setTempName={setTempName}
        tempDesc={tempDesc}
        setTempDesc={setTempDesc}
        tempPrice={tempPrice}
        setTempPrice={setTempPrice}
        tempUnit={tempUnit}
        setTempUnit={setTempUnit}
        tempSoldOut={tempSoldOut}
        setTempSoldOut={setTempSoldOut}
        tempPopular={tempPopular}
        handleTogglePopular={handleTogglePopular}
        tempVegan={tempVegan}
        setTempVegan={setTempVegan}
        tempGlutenFree={tempGlutenFree}
        setTempGlutenFree={setTempGlutenFree}
        tempEgg={tempEgg}
        setTempEgg={setTempEgg}
        tempDairy={tempDairy}
        setTempDairy={setTempDairy}
        tempNuts={tempNuts}
        setTempNuts={setTempNuts}
        tempSoy={tempSoy}
        setTempSoy={setTempSoy}
        saveLocalChanges={saveLocalChanges}
        onDeleteCustom={handleDeleteCustomItem}
      />

      {isDrawerOpen && (
        <Pressable
          style={tw`absolute inset-0 bg-black/40 z-40`}
          onPress={toggleDrawer}
        />
      )}
      <Animated.View
        style={[
          tw`absolute top-0 bottom-0 left-0 bg-white border-r border-slate-200 z-50 pt-8 pb-4 shadow-2xl`,
          { width: DRAWER_WIDTH, transform: [{ translateX: slideAnim }] },
        ]}
      >
        <View style={tw`flex-row items-center justify-between px-6 mb-8`}>
          <Text style={tw`text-lg font-black text-slate-800 uppercase`}>
            Πινακας Ελεγχου
          </Text>
          <TouchableOpacity onPress={toggleDrawer} style={tw`p-2`}>
            <Feather name="x" size={24} color="#64748b" />
          </TouchableOpacity>
        </View>
        <View style={tw`flex-1 px-4`}>
          {ADMIN_TABS.map((tab) => {
            const isActive = activeAdminTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => {
                  setActiveAdminTab(tab.id);
                  toggleDrawer();
                }}
                style={tw`flex-row items-center gap-4 p-4 mb-2 rounded-2xl ${isActive ? "bg-[#97dcf5]" : "bg-transparent"}`}
              >
                <Feather
                  name={tab.icon as any}
                  size={22}
                  color={isActive ? "#0f172a" : "#64748b"}
                />
                <Text
                  style={tw`font-bold text-base ${isActive ? "text-slate-900" : "text-slate-600"}`}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.View>
    </View>
  );
}
