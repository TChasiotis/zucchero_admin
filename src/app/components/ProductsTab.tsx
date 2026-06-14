import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import tw from "twrnc";

interface Props {
  sortedCategories: any[];
  activeItems: any[];
  selectedFoodCategory: string | null;
  setSelectedFoodCategory: (id: string) => void;
  openEditModal: (item: any) => void;
  moveItemUp?: (id: string) => void;
  moveItemDown?: (id: string) => void;
  moveItemToTop?: (id: string) => void;
  moveItemToBottom?: (id: string) => void;
}

export default function ProductsTab({
  sortedCategories,
  activeItems,
  selectedFoodCategory,
  setSelectedFoodCategory,
  openEditModal,
  moveItemUp,
  moveItemDown,
  moveItemToTop,
  moveItemToBottom,
}: Props) {
  const [isSortMode, setIsSortMode] = useState(false);

  // --- ΤΟ ΕΞΥΠΝΟ ΦΙΛΤΡΟ (ΔΙΟΡΘΩΜΕΝΟ) ---
  const displayItems = activeItems.filter((item) => {
    // Ελέγχουμε ΕΙΤΕ αν έχει isSeparator: true, ΕΙΤΕ αν το ID του περιέχει "separator"
    const isSeparator =
      item.isSeparator === true || item.id?.toLowerCase().includes("separator");

    // Αν είναι separator και ΔΕΝ είμαστε σε sort mode, το "σκοτώνουμε" (δεν φαίνεται)
    if (isSeparator && !isSortMode) return false;

    return true;
  });

  return (
    <View style={tw`flex-1`}>
      {/* HEADER ΛΙΣΤΑΣ: Κατηγορίες & Κουμπί Ταξινόμησης */}
      <View style={tw`flex-row items-center justify-between mb-4`}>
        <View style={tw`flex-1 mr-4`}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={tw`gap-2`}
          >
            {sortedCategories.map((cat) => {
              const isSelected = selectedFoodCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setSelectedFoodCategory(cat.id)}
                  style={tw`px-4 py-2 rounded-full border ${isSelected ? "bg-slate-900 border-slate-900" : "bg-white border-slate-200"}`}
                >
                  <Text
                    style={tw`font-bold ${isSelected ? "text-white" : "text-slate-600"}`}
                  >
                    {cat.translations?.el || "Άγνωστη"}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ΤΟ ΜΑΓΙΚΟ ΚΟΥΜΠΙ "Ταξινόμηση" */}
        <TouchableOpacity
          onPress={() => setIsSortMode(!isSortMode)}
          style={tw`flex-row items-center gap-2 px-4 py-2 rounded-full border ${isSortMode ? "bg-emerald-100 border-emerald-200" : "bg-indigo-50 border-indigo-100"}`}
        >
          <Feather
            name={isSortMode ? "check" : "move"}
            size={18}
            color={isSortMode ? "#059669" : "#4f46e5"}
          />
          <Text
            style={tw`font-black ${isSortMode ? "text-emerald-700" : "text-indigo-700"}`}
          >
            {isSortMode ? "Τέλος Ταξινόμησης" : "Ταξινόμηση"}
          </Text>
        </TouchableOpacity>
      </View>

      <View
        style={tw`flex-1 bg-white border border-slate-200 rounded-3xl overflow-hidden`}
      >
        <FlatList
          data={displayItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            // Ο ίδιος έλεγχος για να ξέρουμε πώς θα το σχεδιάσουμε
            const isSeparator =
              item.isSeparator === true ||
              item.id?.toLowerCase().includes("separator");

            // =========================================================
            // 1. ΣΧΕΔΙΑΣΜΟΣ SEPARATOR (ΦΑΙΝΕΤΑΙ ΜΟΝΟ ΣΤΗΝ ΤΑΞΙΝΟΜΗΣΗ)
            // =========================================================
            if (isSeparator) {
              return (
                <View
                  style={tw`flex-row items-center justify-between p-4 border-b border-slate-200 bg-slate-800`}
                >
                  <View style={tw`flex-row items-center gap-3`}>
                    <Feather name="minus" size={24} color="#94a3b8" />
                    {/* Τυπώνουμε ΠΑΝΤΑ "ΔΙΑΧΩΡΙΣΤΙΚΟ" (Hardcoded για τα μάτια του χρήστη) */}
                    <Text
                      style={tw`text-white font-black tracking-widest uppercase`}
                    >
                      --- ΔΙΑΧΩΡΙΣΤΙΚΟ ---
                    </Text>
                  </View>
                  <View
                    style={tw`flex-row items-center gap-2 bg-slate-700 p-1.5 rounded-xl`}
                  >
                    <TouchableOpacity
                      onPress={() => moveItemToTop && moveItemToTop(item.id)}
                      style={tw`p-2 bg-slate-600 rounded-lg active:bg-slate-500`}
                    >
                      <Feather name="chevrons-up" size={18} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => moveItemUp && moveItemUp(item.id)}
                      style={tw`p-2 bg-slate-600 rounded-lg active:bg-slate-500`}
                    >
                      <Feather name="arrow-up" size={18} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => moveItemDown && moveItemDown(item.id)}
                      style={tw`p-2 bg-slate-600 rounded-lg active:bg-slate-500`}
                    >
                      <Feather name="arrow-down" size={18} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() =>
                        moveItemToBottom && moveItemToBottom(item.id)
                      }
                      style={tw`p-2 bg-slate-600 rounded-lg active:bg-slate-500`}
                    >
                      <Feather name="chevrons-down" size={18} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }

            // =========================================================
            // 2. ΣΧΕΔΙΑΣΜΟΣ ΚΑΝΟΝΙΚΟΥ ΠΡΟΪΟΝΤΟΣ
            // =========================================================
            return (
              <View
                style={tw`flex-row items-center justify-between p-5 border-b border-slate-100 ${item.isSoldOut ? "bg-red-50 opacity-70" : "bg-white"}`}
              >
                <View style={tw`flex-1 mr-4`}>
                  <View style={tw`flex-row items-center gap-2`}>
                    {/* ICONS για Custom / Info / Extra */}
                    {item.id?.startsWith("custom_") && (
                      <Feather name="cpu" size={14} color="#8b5cf6" />
                    )}
                    {item.hidePrice &&
                      item.id?.toLowerCase().includes("info") && (
                        <Feather name="info" size={14} color="#3b82f6" />
                      )}
                    {item.hidePrice &&
                      !item.id?.toLowerCase().includes("info") && (
                        <Feather name="plus-circle" size={14} color="#f59e0b" />
                      )}

                    <Text style={tw`text-lg font-bold text-slate-800`}>
                      {item.translations?.el?.name || "Χωρίς Όνομα"}
                    </Text>

                    {item.isSoldOut && (
                      <View style={tw`bg-red-500 px-2 py-1 rounded`}>
                        <Text
                          style={tw`text-white text-xs font-bold uppercase`}
                        >
                          Εξαντληθηκε
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* ΔΕΙΧΝΟΥΜΕ ΤΗΝ ΠΕΡΙΓΡΑΦΗ ΜΟΝΟ ΑΝ ΔΕΝ ΕΙΜΑΣΤΕ ΣΕ SORT MODE */}
                  {!isSortMode && (
                    <Text
                      style={tw`text-slate-500 text-sm mt-1`}
                      numberOfLines={1}
                    >
                      {item.translations?.el?.description || ""}
                    </Text>
                  )}
                </View>

                <View style={tw`flex-row items-center gap-4`}>
                  {/* ΚΡΥΒΟΥΜΕ ΤΗΝ ΤΙΜΗ ΟΤΑΝ ΕΙΜΑΣΤΕ ΣΕ SORT MODE */}
                  {!isSortMode && (
                    <Text
                      style={tw`text-xl font-black ${item.hidePrice ? "text-slate-400 line-through" : "text-[#97dcf5]"}`}
                    >
                      {item.price}€
                    </Text>
                  )}

                  {/* --- ΛΟΓΙΚΗ ΕΜΦΑΝΙΣΗΣ: Edit vs Sort Panel --- */}
                  {!isSortMode ? (
                    // ΚΟΥΜΠΙ EDIT (Κανονική λειτουργία)
                    <TouchableOpacity
                      onPress={() => openEditModal(item)}
                      style={tw`p-3 bg-slate-100 rounded-lg active:bg-slate-200`}
                    >
                      <Feather name="edit-2" size={18} color="#475569" />
                    </TouchableOpacity>
                  ) : (
                    // CONTROL PANEL ΤΑΞΙΝΟΜΗΣΗΣ (Καθαρό μενού)
                    <View
                      style={tw`flex-row items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200`}
                    >
                      <TouchableOpacity
                        onPress={() => moveItemToTop && moveItemToTop(item.id)}
                        style={tw`p-2.5 bg-white rounded-lg shadow-sm border border-slate-100 active:bg-slate-100`}
                      >
                        <Feather name="chevrons-up" size={20} color="#0f172a" />
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => moveItemUp && moveItemUp(item.id)}
                        style={tw`p-2.5 bg-white rounded-lg shadow-sm border border-slate-100 active:bg-indigo-50`}
                      >
                        <Feather name="arrow-up" size={20} color="#4f46e5" />
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => moveItemDown && moveItemDown(item.id)}
                        style={tw`p-2.5 bg-white rounded-lg shadow-sm border border-slate-100 active:bg-indigo-50`}
                      >
                        <Feather name="arrow-down" size={20} color="#4f46e5" />
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() =>
                          moveItemToBottom && moveItemToBottom(item.id)
                        }
                        style={tw`p-2.5 bg-white rounded-lg shadow-sm border border-slate-100 active:bg-slate-100`}
                      >
                        <Feather
                          name="chevrons-down"
                          size={20}
                          color="#0f172a"
                        />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            );
          }}
        />
      </View>
    </View>
  );
}
