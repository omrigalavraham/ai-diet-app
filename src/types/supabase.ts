export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    name: string | null
                    gender: 'male' | 'female' | 'other' | null
                    age: number | null
                    height: number | null
                    weight: number | null
                    goal_weight: number | null
                    activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | null
                    dietary_preferences: string[] | null
                    allergies: string[] | null
                    disliked_foods: string[] | null
                    target_daily_calories: number | null
                    target_macros: Json | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id: string
                    name?: string | null
                    gender?: 'male' | 'female' | 'other' | null
                    age?: number | null
                    height?: number | null
                    weight?: number | null
                    goal_weight?: number | null
                    activity_level?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | null
                    dietary_preferences?: string[] | null
                    allergies?: string[] | null
                    disliked_foods?: string[] | null
                    target_daily_calories?: number | null
                    target_macros?: Json | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    name?: string | null
                    gender?: 'male' | 'female' | 'other' | null
                    age?: number | null
                    height?: number | null
                    weight?: number | null
                    goal_weight?: number | null
                    activity_level?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | null
                    dietary_preferences?: string[] | null
                    allergies?: string[] | null
                    disliked_foods?: string[] | null
                    target_daily_calories?: number | null
                    target_macros?: Json | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Relationships: []
            }
            weekly_plans: {
                Row: {
                    id: string
                    user_id: string
                    start_date: string
                    plan_data: Json
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    start_date: string
                    plan_data?: Json
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    start_date?: string
                    plan_data?: Json
                    created_at?: string | null
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "weekly_plans_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            weight_logs: {
                Row: {
                    id: string
                    user_id: string
                    date: string
                    weight: number
                    mood: string | null
                    notes: string | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    date: string
                    weight: number
                    mood?: string | null
                    notes?: string | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    date?: string
                    weight?: number
                    mood?: string | null
                    notes?: string | null
                    created_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "weight_logs_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            workout_logs: {
                Row: {
                    id: string
                    user_id: string
                    date: string
                    burned_calories: number
                    duration_minutes: number
                    type: string | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    date: string
                    burned_calories: number
                    duration_minutes: number
                    type?: string | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    date?: string
                    burned_calories?: number
                    duration_minutes?: number
                    type?: string | null
                    created_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "workout_logs_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            gender_type: 'male' | 'female' | 'other'
            activity_level_type: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
