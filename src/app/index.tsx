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
  TouchableOpacity,
  View,
} from "react-native";
import tw from "twrnc";

import BannersTab from "./components/BannersTab";
import BoxesTab from "./components/BoxesTab";
import CategoriesTab from "./components/CategoriesTab";
import EditProductModal from "./components/EditProductModal";
import NewProductTab from "./components/NewProductTab";
import ProductsTab from "./components/ProductsTab";

const { width } = Dimensions.get("window");
const DRAWER_WIDTH = 300;

const ADMIN_TABS = [
  { id: "banners", label: "Μπάνερ Διαφημίσεων", icon: "image" },
  { id: "categories", label: "Κατηγορίες", icon: "list" },
  { id: "products", label: "Προϊόντα", icon: "box" },
  { id: "new_product", label: "Νέο Προϊόν", icon: "plus-circle" },
  { id: "boxes", label: "Αποθήκη Κουτιών", icon: "archive" },
];

export default function AdminDashboard() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;

  const [activeAdminTab, setActiveAdminTab] = useState(ADMIN_TABS[2].id);
  const [categories, setCategories] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFoodCategory, setSelectedFoodCategory] = useState<
    string | null
  >(null);

  const [pendingChanges, setPendingChanges] = useState<Record<string, any>>({});
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [tempPrice, setTempPrice] = useState("");
  const [tempSoldOut, setTempSoldOut] = useState(false);
  const [tempPopular, setTempPopular] = useState(false);

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
        if (response.data.categories.length > 0)
          setSelectedFoodCategory(response.data.categories[0].id);
      }
    } catch (error) {
      alert("Αποτυχία σύνδεσης API!");
    } finally {
      setIsLoading(false);
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
    setTempPrice(item.price ? item.price.toString() : "0");
    setTempSoldOut(item.isSoldOut || false);
    setTempPopular(item.isPopular || false);
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
              isSoldOut: tempSoldOut,
              isPopular: tempPopular,
            }
          : item,
      ),
    );
    setPendingChanges((prev) => ({
      ...prev,
      [editingItem.id]: {
        id: editingItem.id,
        price: parseFloat(tempPrice) || 0,
        isSoldOut: tempSoldOut,
        isPopular: tempPopular,
        isCategoryUpdate: false,
      },
    }));
    setIsEditModalVisible(false);
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

  const activeItems = menuItems.filter((item) => {
    if (item.id.toLowerCase().includes("separator")) return false;
    if (selectedFoodCategory === "popular") return item.isPopular === true;
    return item.categoryId === selectedFoodCategory;
  });
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
      {/* HEADER */}
      <View
        style={tw`h-20 bg-white border-b border-slate-200 flex-row items-center px-6 justify-between z-10`}
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
        <View style={tw`flex-row items-center gap-4`}>
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

      {/* CONTENT SPACE */}
      <View style={tw`flex-1 p-6`}>
        {activeAdminTab === "products" && (
          <ProductsTab
            sortedCategories={sortedCategories}
            activeItems={activeItems}
            selectedFoodCategory={selectedFoodCategory}
            setSelectedFoodCategory={setSelectedFoodCategory}
            openEditModal={openEditModal}
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
            usageStats={usageStats}
            LIMITS={LIMITS}
            incrementAiUsage={incrementAiUsage}
            setPendingChanges={setPendingChanges}
          />
        )}

        {/* --- ΤΑ ΝΕΑ TABS ΠΟΥ ΜΟΛΙΣ ΦΤΙΑΞΑΜΕ --- */}
        {activeAdminTab === "banners" && <BannersTab />}
        {activeAdminTab === "boxes" && <BoxesTab />}
      </View>

      <EditProductModal
        visible={isEditModalVisible}
        editingItem={editingItem}
        onClose={() => setIsEditModalVisible(false)}
        tempPrice={tempPrice}
        setTempPrice={setTempPrice}
        tempSoldOut={tempSoldOut}
        setTempSoldOut={setTempSoldOut}
        tempPopular={tempPopular}
        handleTogglePopular={handleTogglePopular}
        saveLocalChanges={saveLocalChanges}
      />

      {/* DRAWER */}
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
