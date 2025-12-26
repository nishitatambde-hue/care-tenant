import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SetupRequest {
  action: "assign_role" | "get_setup_info";
  role?: string;
  tenant_id?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create client with user's JWT to get their ID
    const supabaseUser = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    
    if (userError || !user) {
      console.error("User error:", userError);
      return new Response(JSON.stringify({ error: "Invalid user" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create admin client for database operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { action, role, tenant_id } = await req.json() as SetupRequest;

    if (action === "get_setup_info") {
      // Get all tenants
      const { data: tenants } = await supabaseAdmin
        .from("tenants")
        .select("id, name, code")
        .eq("is_active", true);

      // Get user's current profile
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("*, user_roles(*)")
        .eq("id", user.id)
        .single();

      // Get departments for the demo tenant
      const { data: departments } = await supabaseAdmin
        .from("departments")
        .select("*")
        .eq("tenant_id", "a1b2c3d4-e5f6-7890-abcd-ef1234567890");

      return new Response(JSON.stringify({
        user_id: user.id,
        email: user.email,
        tenants,
        profile,
        departments,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "assign_role") {
      if (!role || !tenant_id) {
        return new Response(JSON.stringify({ error: "Role and tenant_id required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const validRoles = ["admin", "reception", "doctor", "nurse", "lab_staff", "pharmacy"];
      if (!validRoles.includes(role)) {
        return new Response(JSON.stringify({ error: "Invalid role" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Update profile with tenant_id
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .update({ tenant_id })
        .eq("id", user.id);

      if (profileError) {
        console.error("Profile update error:", profileError);
        return new Response(JSON.stringify({ error: "Failed to update profile" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Delete existing roles for this user/tenant
      await supabaseAdmin
        .from("user_roles")
        .delete()
        .eq("user_id", user.id)
        .eq("tenant_id", tenant_id);

      // Insert new role
      const { error: roleError } = await supabaseAdmin
        .from("user_roles")
        .insert({
          user_id: user.id,
          tenant_id,
          role,
        });

      if (roleError) {
        console.error("Role insert error:", roleError);
        return new Response(JSON.stringify({ error: "Failed to assign role" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // If role is doctor or nurse, create staff profile
      if (role === "doctor" || role === "nurse") {
        const { data: existingStaff } = await supabaseAdmin
          .from("staff_profiles")
          .select("id")
          .eq("user_id", user.id)
          .eq("tenant_id", tenant_id)
          .maybeSingle();

        if (!existingStaff) {
          const deptCode = role === "doctor" ? "GEN-MED" : "GEN-MED";
          const { data: dept } = await supabaseAdmin
            .from("departments")
            .select("id")
            .eq("tenant_id", tenant_id)
            .eq("code", deptCode)
            .single();

          const employeeCode = `${role.toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-4)}`;

          await supabaseAdmin
            .from("staff_profiles")
            .insert({
              user_id: user.id,
              tenant_id,
              department_id: dept?.id,
              employee_code: employeeCode,
              specialization: role === "doctor" ? "General Medicine" : undefined,
              consultation_fee: role === "doctor" ? 500 : 0,
            });
        }
      }

      return new Response(JSON.stringify({ success: true, role, tenant_id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
