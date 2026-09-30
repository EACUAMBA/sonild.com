<?php

namespace App\Policies;

class UserPolicy extends AclPolicy
{
    protected string $resource = 'user';
}
