"use client";

import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from "recharts";
import { 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Info, 
  User, 
  CreditCard, 
  Briefcase, 
  GraduationCap 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Types for our API response
interface Explanation {
  feature: string;
  value: number;
  display_name: string;
}

interface PredictionResponse {
  status: string;
  prediction: number;
  probability: number;
  explanation: Explanation[];
  message?: string;
}

export default function LoanAdvisorDashboard() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [formData, setFormData] = useState({
    person_age: 30,
    person_gender: "male",
    person_education: "Bachelor",
    person_income: 50000,
    person_emp_exp: 5,
    person_home_ownership: "RENT",
    loan_amnt: 10000,
    loan_intent: "PERSONAL",
    loan_int_rate: 11.5,
    loan_percent_income: 0.2,
    cb_person_cred_hist_length: 5,
    credit_score: 700,
    previous_loan_defaults_on_file: "No"
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: e.target.type === "number" ? parseFloat(value) : value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error fetching prediction:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      {/* Header */}
      <header className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-700 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
            BPM
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Banque Populaire du Monde</h1>
            <p className="text-slate-500 text-sm font-medium">Loan Advisor Intelligence Platform</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          System Active: AI Model v2.4
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Form */}
        <section className="lg:col-span-5">
          <Card className="shadow-xl border-none ring-1 ring-slate-200">
            <CardHeader className="border-b border-slate-100 bg-white rounded-t-xl">
              <CardTitle className="text-xl flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Customer Details
              </CardTitle>
              <CardDescription>Enter new applicant information to get a loan decision.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6 pt-6 bg-white">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="person_age">Age</Label>
                    <Input id="person_age" name="person_age" type="number" value={formData.person_age} onChange={handleInputChange} className="bg-slate-50" />
                  </div>
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select value={formData.person_gender} onValueChange={(v) => handleSelectChange("person_gender", v)}>
                      <SelectTrigger className="bg-slate-50">
                        <SelectValue placeholder="Gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Education Level</Label>
                  <Select value={formData.person_education} onValueChange={(v) => handleSelectChange("person_education", v)}>
                    <SelectTrigger className="bg-slate-50">
                      <SelectValue placeholder="Education" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High School">High School</SelectItem>
                      <SelectItem value="Associate">Associate</SelectItem>
                      <SelectItem value="Bachelor">Bachelor</SelectItem>
                      <SelectItem value="Master">Master</SelectItem>
                      <SelectItem value="Doctorate">Doctorate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="person_income">Annual Income ($)</Label>
                    <Input id="person_income" name="person_income" type="number" value={formData.person_income} onChange={handleInputChange} className="bg-slate-50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="person_emp_exp">Exp. (Years)</Label>
                    <Input id="person_emp_exp" name="person_emp_exp" type="number" value={formData.person_emp_exp} onChange={handleInputChange} className="bg-slate-50" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Home Ownership</Label>
                    <Select value={formData.person_home_ownership} onValueChange={(v) => handleSelectChange("person_home_ownership", v)}>
                      <SelectTrigger className="bg-slate-50">
                        <SelectValue placeholder="Ownership" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="RENT">Rent</SelectItem>
                        <SelectItem value="MORTGAGE">Mortgage</SelectItem>
                        <SelectItem value="OWN">Own</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Loan Intent</Label>
                    <Select value={formData.loan_intent} onValueChange={(v) => handleSelectChange("loan_intent", v)}>
                      <SelectTrigger className="bg-slate-50">
                        <SelectValue placeholder="Intent" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PERSONAL">Personal</SelectItem>
                        <SelectItem value="EDUCATION">Education</SelectItem>
                        <SelectItem value="MEDICAL">Medical</SelectItem>
                        <SelectItem value="VENTURE">Venture</SelectItem>
                        <SelectItem value="HOMEIMPROVEMENT">Home Improvement</SelectItem>
                        <SelectItem value="DEBTCONSOLIDATION">Debt Consolidation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="loan_amnt">Loan Amount ($)</Label>
                    <Input id="loan_amnt" name="loan_amnt" type="number" value={formData.loan_amnt} onChange={handleInputChange} className="bg-slate-50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="credit_score">Credit Score</Label>
                    <Input id="credit_score" name="credit_score" type="number" value={formData.credit_score} onChange={handleInputChange} className="bg-slate-50" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Previous Default on File?</Label>
                  <Select value={formData.previous_loan_defaults_on_file} onValueChange={(v) => handleSelectChange("previous_loan_defaults_on_file", v)}>
                    <SelectTrigger className="bg-slate-50">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="No">No</SelectItem>
                      <SelectItem value="Yes">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter className="bg-slate-50 rounded-b-xl border-t border-slate-100 p-6">
                <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800 text-white shadow-md transition-all h-12 text-lg" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Analyzing Risk...
                    </>
                  ) : (
                    "Evaluate Application"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </section>

        {/* Prediction & Explanation */}
        <section className="lg:col-span-7 space-y-8">
          <AnimatePresence mode="wait">
            {!result && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 rounded-3xl bg-white"
              >
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                  <Info className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800">Ready for Assessment</h3>
                <p className="text-slate-500 max-w-sm mx-auto mt-2">
                  Complete the customer profile on the left to generate an AI-powered loan decision and risk analysis.
                </p>
              </motion.div>
            )}

            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center space-y-4"
              >
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg animate-pulse" />
                  </div>
                </div>
                <p className="text-slate-600 font-medium animate-pulse">Running advanced risk scoring...</p>
              </motion.div>
            )}

            {result && result.status === "success" && result.explanation && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                {/* Decision Card */}
                <Card className={`overflow-hidden border-none shadow-2xl ring-1 ${result.prediction === 1 ? 'ring-green-100' : 'ring-red-100'}`}>
                  <div className={`h-2 w-full ${result.prediction === 1 ? 'bg-green-500' : 'bg-red-500'}`} />
                  <CardContent className="p-8 bg-white">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                      <div className={`w-24 h-24 rounded-full flex items-center justify-center shadow-inner ${result.prediction === 1 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        {result.prediction === 1 ? <CheckCircle2 className="w-12 h-12" /> : <XCircle className="w-12 h-12" />}
                      </div>
                      <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                          <h2 className="text-3xl font-bold text-slate-900">
                            {result.prediction === 1 ? "Loan Approved" : "Loan Rejected"}
                          </h2>
                          <Badge variant={result.prediction === 1 ? "success" : "destructive"} className="px-3 py-1">
                            Confidence: {(result.probability * 100).toFixed(1)}%
                          </Badge>
                        </div>
                        <p className="text-slate-500 text-lg">
                          {result.prediction === 1 
                            ? "This applicant meets the BPM risk tolerance criteria for this loan amount." 
                            : "Based on current risk modeling, we cannot approve this loan request at this time."}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Explanation Card */}
                <Card className="border-none shadow-xl ring-1 ring-slate-200 bg-white">
                  <CardHeader className="border-b border-slate-100">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-blue-600" />
                      Decision Justification (SHAP Analysis)
                    </CardTitle>
                    <CardDescription>Key factors contributing to this AI decision.</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-8">
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={result.explanation}
                          layout="vertical"
                          margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                          <XAxis type="number" hide />
                          <YAxis 
                            dataKey="display_name" 
                            type="category" 
                            width={120}
                            tick={{ fontSize: 12, fontWeight: 500, fill: '#64748b' }}
                          />
                          <Tooltip 
                            cursor={{ fill: '#f8fafc' }}
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-white p-3 shadow-xl rounded-lg border border-slate-100">
                                    <p className="font-bold text-slate-900">{data.display_name}</p>
                                    <p className={`text-sm font-medium ${data.value > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                      {data.value > 0 ? 'Positive Impact' : 'Negative Impact'}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">SHAP value: {data.value.toFixed(4)}</p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                            {result.explanation.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={entry.value > 0 ? '#10b981' : '#ef4444'} 
                                fillOpacity={0.8}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-6 grid grid-cols-2 gap-4">
                      <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                        <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-1">Top Strength</p>
                        <p className="text-sm font-medium text-slate-700">
                          {result.explanation.filter(e => e.value > 0)[0]?.display_name || "N/A"}
                        </p>
                      </div>
                      <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                        <p className="text-xs font-bold text-red-700 uppercase tracking-wider mb-1">Top Risk Factor</p>
                        <p className="text-sm font-medium text-slate-700">
                          {result.explanation.filter(e => e.value < 0)[0]?.display_name || "N/A"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {result && result.status === "error" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-4"
              >
                <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center shrink-0">
                  <XCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-red-900">Analysis Failed</h3>
                  <p className="text-red-700 text-sm mt-1">{result.message || "An unexpected error occurred while processing the request."}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      <footer className="max-w-6xl mx-auto mt-12 pt-8 border-t border-slate-200 text-center">
        <p className="text-slate-400 text-sm">
          &copy; 2025 Banque Populaire du Monde (BPM). Proprietary Risk Intelligence System.
          <br />
          For authorized advisor use only. Decision support system, final authority resides with the Loan Committee.
        </p>
      </footer>
    </div>
  );
}
