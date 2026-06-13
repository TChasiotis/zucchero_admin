import { Feather } from "@expo/vector-icons";
import { GoogleGenerativeAI } from "@google/generative-ai";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import tw from "twrnc";

interface Props {
  sortedCategories: any[];
  menuItems: any[];
  usageStats: { commits: number; aiRequests: number };
  LIMITS: { commits: number; aiRequests: number };
  incrementAiUsage: () => Promise<void>;
  setPendingChanges: React.Dispatch<React.SetStateAction<Record<string, any>>>;
}

let cachedLatestFlashModel: string | null = null;

const getDynamicFlashModel = async (apiKey: string) => {
  if (cachedLatestFlashModel) return cachedLatestFlashModel;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
    );
    const data = await response.json();

    const flashModels = data.models.filter(
      (m: any) =>
        m.name.includes("flash") &&
        !m.name.includes("preview") &&
        !m.name.includes("tts") &&
        !m.name.includes("vision") &&
        m.supportedGenerationMethods.includes("generateContent"),
    );

    const latestModelName = flashModels[flashModels.length - 1].name.replace(
      "models/",
      "",
    );

    cachedLatestFlashModel = latestModelName;
    console.log(
      "Βρέθηκε δυναμικό μοντέλο AI (Σταθερό):",
      cachedLatestFlashModel,
    );

    return cachedLatestFlashModel;
  } catch (error) {
    console.error("Σφάλμα δυναμικής εύρεσης, χρήση Fallback:", error);
    return "gemini-2.5-flash";
  }
};

export default function NewProductTab({
  sortedCategories,
  menuItems,
  usageStats,
  LIMITS,
  incrementAiUsage,
  setPendingChanges,
}: Props) {
  const [newProductName, setNewProductName] = useState("");
  const [newProductDesc, setNewProductDesc] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("");
  const [newProductUnit, setNewProductUnit] = useState<string | null>(null); // Default null (Κομμάτι)
  const [newProductCategory, setNewProductCategory] = useState<string | null>(
    sortedCategories[0]?.id || null,
  );
  const [isLoading, setIsLoading] = useState(false);

  const ACTIVE_LIMITS = { ...LIMITS, aiRequests: 20 };

  const generateFullProductData = async (
    greekName: string,
    greekDesc: string,
    price: number,
    categoryId: string,
  ) => {
    if (usageStats.aiRequests >= ACTIVE_LIMITS.aiRequests) {
      Alert.alert("Όριο AI", "Έφτασες το όριο για σήμερα!");
      return null;
    }
    try {
      setIsLoading(true);
      const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";

      const dynamicModelName = await getDynamicFlashModel(apiKey);
      const genAI = new GoogleGenerativeAI(apiKey);

      const model = genAI.getGenerativeModel({
        model: dynamicModelName || "gemini-2.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
        },
      });

      const prompt = `Είσαι ένας κορυφαίος, εξειδικευμένος μεταφραστής καταλόγων εστιατορίων και μενού. Το σύστημά μας βασίζεται 100% σε εσένα για την απευθείας και αυτοματοποιημένη εισαγωγή των δεδομένων στη βάση (database), χωρίς κανέναν ανθρώπινη έλεγχο. Πρέπει να είσαι αλάνθαστος, απόλυτα ακριβής και να ακολουθήσεις τους παρακάτω κανόνες κατά γράμμα.

ΣΟΥ ΔΙΝΟΝΤΑΙ ΤΑ ΕΞΗΣ ΕΛΛΗΝΙΚΑ ΔΕΔΟΜΕΝΑ (ΠΡΩΤΟΤΥΠΟ):
Όνομα: "${greekName}"
Περιγραφή: "${greekDesc}"

ΑΠΑΙΤΗΣΕΙΣ ΚΑΙ ΟΔΗΓΙΕΣ ΜΕΤΑΦΡΑΣΗΣ ΑΝΑ ΓΛΩΣΣΑ (el, en, de, fr, es, sr, bg, ro):

1. Ελληνικά (el):
   - name: Διατήρησε το ακριβώς όπως δόθηκε ("${greekName}").
   - description: Διατήρησε το ακριβώς όπως δόθηκε ("${greekDesc}").

2. Αγγλικά (en):
   - name: Μετάφρασε το όνομα στα Αγγλικά με επαγγελματικό, φυσικό γαστρονομικό όρο.
   - description: Μετάφρασε την περιγραφή στα Αγγλικά.

3. Άλλες γλώσσες (de - Γερμανικά, fr - Γαλλικά, es - Ισπανικά, sr - Σέρβικα, bg - Βουλγάρικα, ro - Ρουμάνικα):
   - name: ΑΥΣΤΗΡΟΣ ΚΑΝΟΝΑΣ - Πρέπει να είναι ΑΚΡΙΒΩΣ η ΑΓΓΛΙΚΗ μετάφραση του ονόματος (αυτή που δημιούργησες στο βήμα 2). Απαγορεύεται να μεταφράσεις το "name" σε αυτές τις γλώσσες.
   - description: Πρέπει να μεταφραστεί στην εκάστοτε γλώσσα. ΕΙΔΙΚΗ ΟΔΗΓΙΑ: Εάν υπάρχει μια συγκεκριμένη, καθιερωμένη ή τοπική ονομασία για αυτό το προϊόν στην εκάστοτε γλώσσα, υποχρεούσαι να την τοποθετήσεις ΣΤΗΝ ΑΡΧΗ της περιγραφής.

ΑΥΣΤΗΡΟΣ ΚΑΝΟΝΑΣ ΕΞΟΔΟΥ (CRITICAL JSON FORMATTING):
- Η μορφή πρέπει να είναι ΑΚΡΙΒΩΣ αυτή (χωρίς κανένα άλλο σχόλιο):
{
  "el": { "name": "...", "description": "..." },
  "en": { "name": "...", "description": "..." },
  "de": { "name": "...", "description": "..." },
  "fr": { "name": "...", "description": "..." },
  "es": { "name": "...", "description": "..." },
  "sr": { "name": "...", "description": "..." },
  "bg": { "name": "...", "description": "..." },
  "ro": { "name": "...", "description": "..." }
}`;

      const result = await model.generateContent(prompt);
      const cleanJson = result.response.text();
      const translations = JSON.parse(cleanJson);

      // ΥΠΟΛΟΓΙΣΜΟΣ ΜΕΓΙΣΤΟΥ SORT ORDER ΓΙΑ ΝΑ ΜΠΕΙ ΤΕΡΜΑ ΚΑΤΩ
      const categoryItems = menuItems.filter(
        (i) => i.categoryId === categoryId,
      );
      const maxSortOrder =
        categoryItems.length > 0
          ? Math.max(...categoryItems.map((i) => i.sortOrder || 0))
          : -1;

      const newProduct = {
        id: `custom_${Date.now()}`,
        categoryId: categoryId,
        price: price,
        unit: newProductUnit, // Αποθήκευση της επιλογής (null, kg, portion)
        translations: translations,
        sortOrder: maxSortOrder + 1,
        isPopular: false,
        isVegan: false,
        isGlutenFree: false,
        hasEgg: false,
        hasDairy: false,
        hasNuts: false,
        hasSoy: false,
        isSoldOut: false,
        isSeparator: false,
        isNewProduct: true,
      };
      await incrementAiUsage();
      return newProduct;
    } catch (e) {
      console.error("AI Error:", e);
      Alert.alert("Σφάλμα", "Αποτυχία μετάφρασης AI. Δοκίμασε ξανά.");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNewProduct = async () => {
    if (
      !newProductName ||
      !newProductPrice ||
      !newProductCategory ||
      !newProductDesc
    ) {
      Alert.alert(
        "Προσοχή",
        "Το όνομα, η περιγραφή, η τιμή και η κατηγορία είναι υποχρεωτικά!",
      );
      return;
    }
    const priceNum = parseFloat(newProductPrice.replace(",", "."));
    if (isNaN(priceNum)) {
      Alert.alert("Λάθος", "Η τιμή πρέπει να είναι αριθμός.");
      return;
    }
    const data = await generateFullProductData(
      newProductName,
      newProductDesc,
      priceNum,
      newProductCategory,
    );
    if (data) {
      setPendingChanges((prev) => ({ ...prev, [data.id]: data }));
      setNewProductName("");
      setNewProductDesc("");
      setNewProductPrice("");
      setNewProductUnit(null); // Reset σε Κομμάτι
      Alert.alert(
        "Έτοιμο!",
        "Το προϊόν μεταφράστηκε τέλεια και μπήκε στο καλάθι αλλαγών. Πάτα 'Υποβολή' πάνω δεξιά!",
      );
    }
  };

  return (
    <ScrollView
      contentContainerStyle={tw`flex-grow justify-start items-center p-4`}
    >
      <View
        style={tw`bg-white w-[96%] max-w-6xl rounded-3xl p-10 border border-slate-200 shadow-sm`}
      >
        <View
          style={tw`flex-row items-center gap-4 mb-10 border-b border-slate-100 pb-6`}
        >
          <Feather name="plus-circle" size={36} color="#0f172a" />
          <Text style={tw`text-4xl font-black text-slate-900`}>Νέο Προϊόν</Text>
        </View>

        <Text
          style={tw`text-lg font-bold text-slate-500 mb-3 uppercase tracking-wide`}
        >
          Όνομα Προϊόντος (Ελληνικά)
        </Text>
        <TextInput
          style={tw`bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 mb-8 text-slate-800 text-2xl`}
          placeholder="π.χ. Τούρτα Φράουλα"
          value={newProductName}
          onChangeText={setNewProductName}
          textAlignVertical="center"
        />

        <Text
          style={tw`text-lg font-bold text-slate-500 mb-3 uppercase tracking-wide`}
        >
          Περιγραφή (Υποχρεωτικό)
        </Text>
        <TextInput
          style={tw`bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 mb-8 text-slate-800 text-xl min-h-[150px]`}
          placeholder="Αναλυτική περιγραφή στα ελληνικά..."
          multiline
          textAlignVertical="top"
          value={newProductDesc}
          onChangeText={setNewProductDesc}
        />

        <View style={tw`flex-row gap-8 mb-8`}>
          <View style={tw`w-1/3`}>
            <Text
              style={tw`text-lg font-bold text-slate-500 mb-3 uppercase tracking-wide`}
            >
              Τιμή (€)
            </Text>
            <TextInput
              style={tw`bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 text-slate-900 font-bold text-3xl text-center`}
              placeholder="0.00"
              keyboardType="decimal-pad"
              value={newProductPrice}
              onChangeText={setNewProductPrice}
            />
          </View>
        </View>

        {/* --- ΝΕΟ: ΕΠΙΛΟΓΗ UNIT ΣΤΗ ΔΗΜΙΟΥΡΓΙΑ --- */}
        <Text
          style={tw`text-lg font-bold text-slate-500 mb-3 uppercase tracking-wide`}
        >
          Μονάδα Μέτρησης
        </Text>
        <View style={tw`flex-row gap-4 mb-8 max-w-md`}>
          <TouchableOpacity
            onPress={() => setNewProductUnit(null)}
            style={tw`flex-1 py-4 rounded-2xl border-2 items-center ${newProductUnit === null ? "bg-indigo-50 border-indigo-500" : "bg-slate-50 border-slate-200"}`}
          >
            <Text
              style={tw`font-black text-lg ${newProductUnit === null ? "text-indigo-700" : "text-slate-600"}`}
            >
              Κομμάτι
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setNewProductUnit("kg")}
            style={tw`flex-1 py-4 rounded-2xl border-2 items-center ${newProductUnit === "kg" ? "bg-indigo-50 border-indigo-500" : "bg-slate-50 border-slate-200"}`}
          >
            <Text
              style={tw`font-black text-lg ${newProductUnit === "kg" ? "text-indigo-700" : "text-slate-600"}`}
            >
              Κιλό
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setNewProductUnit("portion")}
            style={tw`flex-1 py-4 rounded-2xl border-2 items-center ${newProductUnit === "portion" ? "bg-indigo-50 border-indigo-500" : "bg-slate-50 border-slate-200"}`}
          >
            <Text
              style={tw`font-black text-lg ${newProductUnit === "portion" ? "text-indigo-700" : "text-slate-600"}`}
            >
              Μερίδα
            </Text>
          </TouchableOpacity>
        </View>

        <Text
          style={tw`text-lg font-bold text-slate-500 mb-4 uppercase tracking-wide`}
        >
          Επιλογή Κατηγορίας
        </Text>
        <View style={tw`flex-row flex-wrap gap-4 mb-12`}>
          {sortedCategories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => setNewProductCategory(cat.id)}
              style={tw`px-6 py-4 rounded-2xl border-2 ${newProductCategory === cat.id ? "bg-[#97dcf5] border-[#97dcf5]" : "bg-white border-slate-200"}`}
            >
              <Text
                style={tw`font-black text-lg ${newProductCategory === cat.id ? "text-slate-900" : "text-slate-600"}`}
              >
                {cat.translations?.el || "Άγνωστη"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          onPress={handleCreateNewProduct}
          disabled={isLoading}
          style={tw`${isLoading ? "bg-indigo-400" : "bg-indigo-600"} flex-row items-center justify-center gap-4 py-6 rounded-2xl active:bg-indigo-700 mt-2 shadow-sm`}
        >
          {isLoading ? (
            <ActivityIndicator color="white" size="large" />
          ) : (
            <Feather name="cpu" size={28} color="white" />
          )}
          <Text style={tw`text-white font-black text-2xl tracking-wide`}>
            {isLoading ? "Επεξεργασία AI..." : "Μετάφραση AI & Προσθήκη"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
