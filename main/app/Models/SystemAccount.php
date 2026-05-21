<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

use App\Traits\Auditable;

class SystemAccount extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\SystemAccountFactory> */
    use HasFactory, Notifiable, Auditable;

    protected $table = 'system_accounts';
    protected $primaryKey = 'sys_id';
    public $incrementing = true;

    protected $fillable = [
        'sys_account_id',
        'sys_password',
        'sys_fname',
        'sys_mname',
        'sys_lname',
        'email',
        'is_deleted',
        'delete_reason',
        'date_created',
        'last_login',
        'last_activity',
    ];

    protected $casts = [
        'date_created'  => 'date',
        'is_deleted'    => 'boolean',
        'last_login'    => 'datetime',
        'last_activity' => 'datetime',
    ];

    protected $hidden = [
        'sys_password',
        'remember_token',
    ];

    public $timestamps = false;

    /**
     * The column that Laravel uses to look up the authenticated user.
     * Must match the primary key for session-based auth.
     */
    public function getAuthIdentifierName(): string
    {
        return 'sys_id';
    }

    /**
     * Tell EloquentUserProvider to hash-check against sys_password, not 'password'.
     */
    public function getAuthPasswordName(): string
    {
        return 'sys_password';
    }

    // Relationships
    public function roles()
    {
        return $this->hasMany(Role::class, 'created_by', 'sys_id');
    }

    public function permissions()
    {
        return $this->hasMany(SystemPermission::class, 'sys_id', 'sys_id');
    }

    public function auditLogs()
    {
        return $this->hasMany(AuditLog::class, 'sys_id', 'sys_id');
    }

    public function citizensEncoded()
    {
        return $this->hasMany(Citizen::class, 'encoded_by', 'sys_id');
    }

    public function citizensUpdated()
    {
        return $this->hasMany(Citizen::class, 'updated_by', 'sys_id');
    }

    public function citizenHistoriesEncoded()
    {
        return $this->hasMany(CitizenHistory::class, 'encoded_by', 'sys_id');
    }

    public function citizenHistoriesUpdated()
    {
        return $this->hasMany(CitizenHistory::class, 'updated_by', 'sys_id');
    }

    public function medicalHistoriesEncoded()
    {
        return $this->hasMany(MedicalHistory::class, 'encoded_by', 'sys_id');
    }

    public function medicalHistoriesUpdated()
    {
        return $this->hasMany(MedicalHistory::class, 'updated_by', 'sys_id');
    }

    public function settlementLogsEncoded()
    {
        return $this->hasMany(SettlementLog::class, 'encoded_by', 'sys_id');
    }

    public function settlementLogsUpdated()
    {
        return $this->hasMany(SettlementLog::class, 'updated_by', 'sys_id');
    }

    public function householdInfosEncoded()
    {
        return $this->hasMany(HouseholdInfo::class, 'encoded_by', 'sys_id');
    }

    public function householdInfosUpdated()
    {
        return $this->hasMany(HouseholdInfo::class, 'updated_by', 'sys_id');
    }

    public function transactionLogsEncoded()
    {
        return $this->hasMany(TransactionLog::class, 'encoded_by', 'sys_id');
    }

    public function transactionLogsUpdated()
    {
        return $this->hasMany(TransactionLog::class, 'updated_by', 'sys_id');
    }

    public function infrastructuresEncoded()
    {
        return $this->hasMany(Infrastructure::class, 'encoded_by', 'sys_id');
    }

    public function infrastructuresUpdated()
    {
        return $this->hasMany(Infrastructure::class, 'updated_by', 'sys_id');
    }

    public function businessInfosEncoded()
    {
        return $this->hasMany(BusinessInfo::class, 'encoded_by', 'sys_id');
    }

    public function businessInfosUpdated()
    {
        return $this->hasMany(BusinessInfo::class, 'updated_by', 'sys_id');
    }

    /**
     * Get all permission names for this account (cached per request).
     */
    public function permissionNames(): array
    {
        static $cache = [];
        $key = $this->sys_id;
        if (!isset($cache[$key])) {
            $permIds = $this->permissions()->pluck('perm_id')->toArray();
            $cache[$key] = \App\Models\Permission::whereIn('perm_id', $permIds)
                ->pluck('name')->toArray();
        }
        return $cache[$key];
    }

    /**
     * Check if this account has a specific permission by name.
     */
    public function hasPermission(string $permission): bool
    {
        return in_array($permission, $this->permissionNames());
    }

    /**
     * Check if this account has ANY of the given permissions.
     */
    public function hasAnyPermission(array $permissions): bool
    {
        $names = $this->permissionNames();
        foreach ($permissions as $perm) {
            if (in_array($perm, $names)) return true;
        }
        return false;
    }

    /**
     * Return the password for authentication.
     */
    public function getAuthPassword()
    {
        return $this->sys_password;
    }
}
