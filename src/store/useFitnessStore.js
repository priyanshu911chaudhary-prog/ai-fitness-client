import { create } from 'zustand';

export const useFitnessStore = create((set) => ({
  // --- STATE ---
  meals: [
    { id: 1, name: "Egg Bhurji & Bread", calories: 380, protein: 22, carbs: 35, fats: 14, type: "Breakfast" },
    { id: 2, name: "Masala Oats", calories: 250, protein: 8, carbs: 42, fats: 5, type: "Snack" },
    { id: 3, name: "Veggie Sandwich", calories: 320, protein: 12, carbs: 45, fats: 10, type: "Lunch" },
    { id: 4, name: "Mess Dinner (Protein-Rich)", calories: 600, protein: 35, carbs: 65, fats: 20, type: "Dinner" },
  ],
  
  workouts: [
    { id: 1, name: "Push Day: Chest & Triceps", duration: 60, caloriesBurned: 450, type: "Strength" },
    { id: 2, name: "HIIT Cardio Blast", duration: 30, caloriesBurned: 400, type: "Cardio" },
  ],

  // --- ACTIONS ---
  addMeal: (newMeal) => set((state) => ({ 
    meals: [{ ...newMeal, id: Date.now() }, ...state.meals] 
  })),
  
  deleteMeal: (id) => set((state) => ({ 
    meals: state.meals.filter(meal => meal.id !== id) 
  })),

  addWorkout: (newWorkout) => set((state) => ({ 
    workouts: [{ ...newWorkout, id: Date.now() }, ...state.workouts] 
  })),
  
  deleteWorkout: (id) => set((state) => ({ 
    workouts: state.workouts.filter(workout => workout.id !== id) 
  })),
}));