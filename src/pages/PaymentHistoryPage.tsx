import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, CheckCircle, XCircle, Clock, ArrowLeft } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

interface Payment {
  id: string;
  lesson_date: string;
  price: number;
  payment_status: string;
  lesson_type: string;
  tutor: {
    name: string;
  };
}

const PaymentHistoryPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchPayments();
    }
  }, [user]);

  const fetchPayments = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { data: paymentsData } = await supabase
        .from("bookings")
        .select(`
          id,
          lesson_date,
          price,
          payment_status,
          lesson_type,
          tutors:tutor_id (
            name
          )
        `)
        .eq("student_id", user.id)
        .order("lesson_date", { ascending: false });

      const formattedPayments = (paymentsData || []).map((payment: any) => ({
        ...payment,
        tutor: payment.tutors,
      }));
      setPayments(formattedPayments);
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            Pagado
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-500/50">
            <Clock className="w-3 h-3 mr-1" />
            Pendiente
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Fallido
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const totalSpent = payments
    .filter((p) => p.payment_status === "completed")
    .reduce((sum, p) => sum + Number(p.price), 0);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/student-dashboard")}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al panel
            </Button>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10">
                  <CreditCard className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                    Historial de Pagos
                  </h1>
                  <p className="text-muted-foreground">
                    Revisa todos tus pagos y transacciones
                  </p>
                </div>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-sm text-muted-foreground">Total invertido</p>
                <p className="text-2xl font-bold text-foreground">${totalSpent.toFixed(2)}</p>
              </div>
            </div>
          </motion.div>

          {/* Mobile Total */}
          <div className="sm:hidden mb-6">
            <Card>
              <CardContent className="py-4">
                <div className="flex justify-between items-center">
                  <p className="text-muted-foreground">Total invertido</p>
                  <p className="text-xl font-bold text-foreground">${totalSpent.toFixed(2)}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payments List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Transacciones</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="animate-pulse flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded w-32" />
                        <div className="h-3 bg-muted rounded w-24" />
                      </div>
                      <div className="h-6 bg-muted rounded w-16" />
                    </div>
                  ))}
                </div>
              ) : payments.length === 0 ? (
                <div className="text-center py-12">
                  <CreditCard className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No hay pagos registrados</h3>
                  <p className="text-muted-foreground mb-4">Cuando reserves una clase, aparecerá aquí</p>
                  <Button onClick={() => navigate("/tutors")}>
                    Buscar Tutores
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {payments.map((payment, index) => (
                    <motion.div
                      key={payment.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{payment.tutor.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(parseISO(payment.lesson_date), "d MMM yyyy", { locale: es })}
                          {" • "}
                          {payment.lesson_type === "trial" ? "Clase de prueba" : "Clase regular"}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-semibold text-foreground">${Number(payment.price).toFixed(2)}</span>
                        {getStatusBadge(payment.payment_status)}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentHistoryPage;
